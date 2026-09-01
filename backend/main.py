import asyncio
import sqlite3
from datetime import datetime
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from starlette.websockets import WebSocketState

from engine import TelemetryEngine
from soar_playbook import evaluate_defcon, map_mitre_and_remediate

app = FastAPI(
    title="Invincible World Model SOC Engine",
    description="Real-time temporal state predictive threat intelligence API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- SQLite Incident Ledger -----------------
def init_db():
    conn = sqlite3.connect("incidents.db")
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS incidents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT,
            defcon_level INTEGER,
            risk_score REAL,
            residual_error REAL,
            mitre_tactic TEXT,
            mitre_technique_id TEXT,
            top_drifted_feature TEXT,
            soar_rule TEXT
        )
    """)
    conn.commit()
    conn.close()

init_db()

def log_incident(defcon, metrics, mitre, top_feature, rule):
    try:
        conn = sqlite3.connect("incidents.db")
        c = conn.cursor()
        c.execute("""
            INSERT INTO incidents (timestamp, defcon_level, risk_score, residual_error, mitre_tactic, mitre_technique_id, top_drifted_feature, soar_rule)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            datetime.now().isoformat(),
            defcon["level"],
            metrics["risk_score"],
            metrics["residual_error"],
            mitre["tactic"],
            mitre["technique_id"],
            top_feature,
            rule
        ))
        conn.commit()
        conn.close()
    except Exception:
        pass

# ----------------- REST Endpoints -----------------
@app.get("/")
def health_check():
    return {
        "status": "healthy",
        "service": "Invincible World Model SOC Engine",
        "version": "1.0.0",
        "websocket_endpoint": "/ws/stream",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/incidents")
def get_incidents(limit: int = 20):
    conn = sqlite3.connect("incidents.db")
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT * FROM incidents ORDER BY id DESC LIMIT ?", (limit,))
    rows = [dict(r) for r in c.fetchall()]
    conn.close()
    return {"count": len(rows), "incidents": rows}

@app.delete("/api/incidents/clear")
@app.post("/api/incidents/clear")
def clear_incidents():
    conn = sqlite3.connect("incidents.db")
    c = conn.cursor()
    c.execute("DELETE FROM incidents")
    conn.commit()
    conn.close()
    return {"status": "success", "message": "Incident ledger reset successfully"}

# ----------------- Core Engine State -----------------
engine = TelemetryEngine()
active_chaos = None

@app.websocket("/ws/stream")
async def websocket_endpoint(websocket: WebSocket):
    global active_chaos
    await websocket.accept()

    async def receive_commands():
        global active_chaos
        try:
            while True:
                data = await websocket.receive_json()
                action = data.get("action")
                if action == "chaos_inject":
                    active_chaos = data.get("attack_type")
                elif action == "chaos_clear":
                    active_chaos = None
                elif action == "jump_scenario":
                    engine.current_idx = int(data.get("index", 0))
        except (WebSocketDisconnect, RuntimeError, asyncio.CancelledError):
            pass

    receiver_task = asyncio.create_task(receive_commands())

    try:
        while True:
            # If client disconnected or navigated away, exit cleanly
            if websocket.client_state != WebSocketState.CONNECTED:
                break

            step_data = engine.step_inference(active_chaos=active_chaos)
            
            defcon = evaluate_defcon(step_data["risk_score"], step_data["residual_error"])
            soar_eval = map_mitre_and_remediate(
                step_data["deviations"], 
                step_data["risk_score"], 
                step_data["residual_error"]
            )
            
            top_feature = step_data["deviations"][0]["feature"] if step_data.get("deviations") else "N/A"
            
            if defcon["level"] == 1:
                log_incident(
                    defcon, 
                    {"risk_score": step_data["risk_score"], "residual_error": step_data["residual_error"]},
                    soar_eval["mitre"],
                    top_feature,
                    soar_eval["rule"]
                )
            
            obs_flow = step_data["obs_features"].get("Flow Pkts/s", 0.0)
            pred_flow = step_data["pred_features"].get("Flow Pkts/s", 0.0)
            
            payload = {
                "timestamp_idx": engine.current_idx,
                "defcon": defcon,
                "metrics": {
                    "risk_score": step_data["risk_score"],
                    "residual_error": step_data["residual_error"],
                    "is_attack_ground_truth": step_data["gt_label"],
                    "anomaly_flag": defcon["level"] == 1
                },
                "trajectory_split": {
                    "current_observed_val": obs_flow,
                    "current_predicted_val": pred_flow,
                    "divergence_delta": round(abs(obs_flow - pred_flow), 4)
                },
                "kill_chain_meter": {
                    "current_stage": soar_eval["mitre"]["tactic"],
                    "current_stage_idx": soar_eval["mitre"]["stage_idx"],
                    "projected_stage": soar_eval["projected_stage"],
                    "projected_stage_idx": soar_eval["projected_stage_idx"],
                    "progression_confidence": step_data["rollout_risks"][-1] if step_data["rollout_risks"] else 0.0
                },
                "k_step_forecast": {
                    "horizon_seconds": 150,
                    "projected_risks": step_data["rollout_risks"]
                },
                "benchmarks": {
                    "inference_latency_ms": step_data["benchmarks"]["latency_ms"],
                    "throughput_wps": step_data["benchmarks"]["throughput_wps"],
                    "ram_usage_mb": step_data["benchmarks"]["ram_mb"]
                },
                "observed_features": step_data["obs_features"],
                "predicted_features": step_data["pred_features"],
                "feature_deviations": step_data["deviations"],
                "mitre_attribution": soar_eval["mitre"],
                "soar_action": {
                    "rule_generated": soar_eval["rule"],
                    "timestamp": datetime.now().strftime("%H:%M:%S")
                }
            }
            
            if websocket.client_state == WebSocketState.CONNECTED:
                await websocket.send_json(payload)
            else:
                break
                
            await asyncio.sleep(0.3)
            
    except (WebSocketDisconnect, RuntimeError, asyncio.CancelledError):
        pass
    finally:
        receiver_task.cancel()
        try:
            await receiver_task
        except (asyncio.CancelledError, Exception):
            pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)