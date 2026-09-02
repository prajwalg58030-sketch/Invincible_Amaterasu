# backend/soar_playbook.py
from typing import Any, Dict, List


def evaluate_defcon(risk_score: float, residual_error: float) -> Dict[str, Any]:
    """Evaluates system operational status based on physics residual and GRU risk score."""
    if risk_score >= 0.70 or residual_error >= 0.40:
        return {
            "level": 1,
            "label": "DEFCON 1: CRITICAL ZERO-DAY BREACH",
            "color": "#f43f5e",
        }
    elif risk_score >= 0.30 or residual_error >= 0.15:
        return {
            "level": 3,
            "label": "DEFCON 3: ELEVATED THREAT",
            "color": "#f59e0b",
        }
    else:
        return {
            "level": 5,
            "label": "DEFCON 5: EQUILIBRIUM",
            "color": "#10b981",
        }


def map_mitre_and_remediate(
    deviations: List[Dict[str, Any]], 
    risk_score: float, 
    residual_error: float
) -> Dict[str, Any]:
    """
    Maps top feature deviations to MITRE ATT&CK techniques, 
    kill chain horizon stages, and automated SOAR response rules.
    """
    if risk_score < 0.30 and residual_error < 0.15:
        return {
            "mitre": {
                "tactic": "Recon",
                "technique_id": "TA0043",
                "technique_name": "Nominal Enterprise Baseline",
                "stage_idx": 0,
                "mitre_ref": "T1595",
                "description": "Nominal traffic patterns. Telemetry metrics stay within baseline physical equilibrium.",
            },
            "projected_stage": "Initial Access",
            "projected_stage_idx": 1,
            "rule": "RULE_STATUS: PASSIVE_MONITORING | System in equilibrium; dynamic baselines validated.",
        }

    high_drift_count = sum(1 for d in deviations if d.get("deviation", 0.0) >= 0.35)
    top_feature = deviations[0]["feature"] if deviations else "Flow Pkts/s"
    top_dev = deviations[0]["deviation"] if deviations else 0.0

    # Multi-dimensional breach: 4+ dimensions drifting simultaneously without single-point SYN bias
    if high_drift_count >= 4 and "SYN Flag Cnt" not in top_feature:
        return {
            "mitre": {
                "tactic": "Lateral Move",
                "technique_id": "T1190",
                "technique_name": "Multi-D Zero-Day Exploit",
                "stage_idx": 2,
                "mitre_ref": "T1190",
                "description": f"Simultaneous multi-variate violation across {high_drift_count} physical dimensions (+{top_dev:.3f} max drift).",
            },
            "projected_stage": "Command & Control",
            "projected_stage_idx": 3,
            "rule": "ebtables -A FORWARD -p IPv4 --ip-proto tcp -j DROP && docker pause $(docker ps -q --filter 'name=web')",
        }

    if "SYN Flag Cnt" in top_feature:
        return {
            "mitre": {
                "tactic": "Initial Access",
                "technique_id": "T1498.001",
                "technique_name": "SYN Flood Exhaustion",
                "stage_idx": 1,
                "mitre_ref": "T1498.001",
                "description": f"TCP SYN handshake rate exceeded threshold (+{top_dev:.3f}). Socket pool exhaustion imminent.",
            },
            "projected_stage": "Lateral Move",
            "projected_stage_idx": 2,
            "rule": "iptables -A INPUT -p tcp --syn -m limit --limit 50/s --limit-burst 100 -j ACCEPT && iptables -A INPUT -p tcp --syn -j DROP",
        }
    elif any(f in top_feature for f in ["Flow Duration", "Fwd IAT Mean", "Bwd IAT Mean"]):
        return {
            "mitre": {
                "tactic": "Initial Access",
                "technique_id": "T1499",
                "technique_name": "Low & Slow Socket Hold (Slowloris)",
                "stage_idx": 1,
                "mitre_ref": "T1499",
                "description": f"Abnormal socket hold duration detected; packet inter-arrival latency stretched by {int(top_dev * 100)}%.",
            },
            "projected_stage": "Lateral Move",
            "projected_stage_idx": 2,
            "rule": "sysctl -w net.ipv4.tcp_fin_timeout=15 && nginx -s reload -g 'client_body_timeout 5s; keepalive_timeout 5s;'",
        }
    elif any(f in top_feature for f in ["Flow Byts/s", "TotLen Fwd Pkts", "TotLen Bwd Pkts"]):
        return {
            "mitre": {
                "tactic": "Exfiltration",
                "technique_id": "T1048",
                "technique_name": "Asymmetric Data Exfiltration",
                "stage_idx": 4,
                "mitre_ref": "T1048",
                "description": f"Asymmetrical byte volume surge with anomalous payload distribution (+{top_dev:.3f}).",
            },
            "projected_stage": "Exfiltration",
            "projected_stage_idx": 4,
            "rule": "tc qdisc add dev eth0 root tbf rate 10mbit burst 32kbit latency 400ms && iptables -A OUTPUT -p tcp --dport 443 -j NFQUEUE",
        }
    elif any(f in top_feature for f in ["Tot Fwd Pkts", "Tot Bwd Pkts"]):
        return {
            "mitre": {
                "tactic": "Recon",
                "technique_id": "T1595.001",
                "technique_name": "Port Scanning / Sweep",
                "stage_idx": 0,
                "mitre_ref": "T1595.001",
                "description": f"Rapid TCP packet sequence exploration across ephemeral ports (+{top_dev:.3f}).",
            },
            "projected_stage": "Initial Access",
            "projected_stage_idx": 1,
            "rule": "iptables -A INPUT -m recent --name portscan --set && iptables -A INPUT -m recent --name portscan --rcheck --seconds 60 --hitcount 15 -j DROP",
        }
    elif "Flow Pkts/s" in top_feature:
        return {
            "mitre": {
                "tactic": "Initial Access",
                "technique_id": "T1498",
                "technique_name": "Volumetric DoS Saturation",
                "stage_idx": 1,
                "mitre_ref": "T1498",
                "description": f"Packet-per-second rate diverged from baseline dynamics by {int(top_dev * 100)}%.",
            },
            "projected_stage": "Lateral Move",
            "projected_stage_idx": 2,
            "rule": "nft add rule ip filter input ip saddr @bad_actors counter drop; sysctl -w net.core.netdev_max_backlog=10000",
        }
    else:
        return {
            "mitre": {
                "tactic": "Lateral Move",
                "technique_id": "T1190",
                "technique_name": "Multi-D Zero-Day Exploit",
                "stage_idx": 2,
                "mitre_ref": "T1190",
                "description": f"Multi-dimensional physical state violation detected across conservation boundaries (+{top_dev:.3f}).",
            },
            "projected_stage": "Command & Control",
            "projected_stage_idx": 3,
            "rule": "ebtables -A FORWARD -p IPv4 --ip-proto tcp -j DROP && docker pause $(docker ps -q --filter 'name=web')",
        }