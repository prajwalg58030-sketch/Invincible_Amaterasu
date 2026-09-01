import time
import os
import psutil
import torch
import torch.nn as nn
import numpy as np
import pandas as pd

FEATURE_COLS = [
    'Flow Duration', 'Tot Fwd Pkts', 'Tot Bwd Pkts', 'TotLen Fwd Pkts',
    'TotLen Bwd Pkts', 'Flow Byts/s', 'Flow Pkts/s', 'Fwd IAT Mean',
    'Bwd IAT Mean', 'SYN Flag Cnt', 'ACK Flag Cnt'
]

class GRUWorldModel(nn.Module):
    def __init__(self, input_dim=11, hidden_dim=128, num_layers=2):
        super().__init__()
        self.gru = nn.GRU(input_dim, hidden_dim, num_layers, batch_first=True)
        self.dynamics_head = nn.Linear(hidden_dim, input_dim)
        self.risk_head = nn.Sequential(
            nn.Linear(hidden_dim, 64),
            nn.ReLU(),
            nn.Linear(64, 1),
            nn.Sigmoid()
        )
        
    def forward(self, x):
        out, _ = self.gru(x)
        h_last = out[:, -1, :]
        pred_state = self.dynamics_head(h_last)
        pred_risk = self.risk_head(h_last)
        return pred_state, pred_risk

class TelemetryEngine:
    def __init__(self, model_path="invincible_gru_model.pth", data_path="invincible_temporal_states.csv"):
        self.feature_cols = FEATURE_COLS
        self.model = GRUWorldModel(input_dim=len(FEATURE_COLS))
        
        if os.path.exists(model_path):
            try:
                self.model.load_state_dict(torch.load(model_path, map_location=torch.device('cpu')))
            except Exception:
                pass
        self.model.eval()
        
        if os.path.exists(data_path):
            self.df = pd.read_csv(data_path, index_col=0)
            self.features = self.df[self.feature_cols].values.astype(np.float32)
            self.labels = self.df['Label'].values.astype(np.float32) if 'Label' in self.df.columns else np.zeros(len(self.df))
        else:
            self.features = np.random.uniform(0.01, 0.15, size=(1000, 11)).astype(np.float32)
            self.labels = np.zeros(1000, dtype=np.float32)
            
        self.current_idx = 0
        self.max_idx = max(1, len(self.features) - 11)
        self.process = psutil.Process()

    def step_inference(self, active_chaos=None, k_steps=5):
        t_start = time.perf_counter_ns()
        
        # 1. Historical 10-step Context Window
        ctx = self.features[self.current_idx : self.current_idx + 10].copy()
        
        # 2. Ground Truth Observation
        obs_true = self.features[self.current_idx + 10].copy()
        gt_label = float(self.labels[self.current_idx + 10])
        
        # 3. Apply Chaos Injection if active
        if active_chaos:
            from chaos_injector import inject_attack
            obs_true, _ = inject_attack(obs_true, self.feature_cols, active_chaos)
            
        # 4. PyTorch Forward Inference
        inp_tensor = torch.tensor(ctx, dtype=torch.float32).unsqueeze(0)
        with torch.no_grad():
            pred_state_t, pred_risk_t = self.model(inp_tensor)
            
        p_state = pred_state_t.squeeze(0).numpy()
        p_risk = float(pred_risk_t.item())
        
        # 5. Forecast Residual & Drift Vector
        residual = float(np.linalg.norm(obs_true - p_state))
        deviations = [
            {"feature": feat, "drift": round(float(abs(obs_true[i] - p_state[i])), 4)}
            for i, feat in enumerate(self.feature_cols)
        ]
        deviations.sort(key=lambda x: x["drift"], reverse=True)
        
        # 6. K-Step Autoregressive Rollout
        rollout_risks = []
        sim_seq = ctx.copy()
        with torch.no_grad():
            for _ in range(k_steps):
                sim_inp = torch.tensor(sim_seq, dtype=torch.float32).unsqueeze(0)
                sim_p_state, sim_p_risk = self.model(sim_inp)
                sim_state_np = sim_p_state.squeeze(0).numpy()
                rollout_risks.append(round(float(sim_p_risk.item()), 4))
                sim_seq = np.vstack([sim_seq[1:], sim_state_np])
                
        # 7. Benchmarks
        t_end = time.perf_counter_ns()
        latency_ms = round((t_end - t_start) / 1_000_000, 2)
        throughput = round(1000 / max(latency_ms, 0.01), 1)
        ram_mb = round(self.process.memory_info().rss / (1024 * 1024), 1)
        
        # Advance Timeline Pointer
        self.current_idx = (self.current_idx + 1) % self.max_idx
        
        return {
            "obs_features": {self.feature_cols[i]: round(float(obs_true[i]), 4) for i in range(11)},
            "pred_features": {self.feature_cols[i]: round(float(p_state[i]), 4) for i in range(11)},
            "risk_score": round(p_risk, 4),
            "residual_error": round(residual, 4),
            "gt_label": gt_label,
            "deviations": deviations,
            "rollout_risks": rollout_risks,
            "benchmarks": {
                "latency_ms": latency_ms,
                "throughput_wps": throughput,
                "ram_mb": ram_mb
            }
        }