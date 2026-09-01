def evaluate_defcon(risk_score: float, residual: float):
    """
    Calculates DEFCON alert level based on risk score and physics residual error.
    """
    if risk_score >= 0.65 or residual >= 0.45:
        return {
            "level": 1,
            "label": "DEFCON 1: CRITICAL ZERO-DAY BREACH",
            "color": "#ef4444",
            "pulse_speed": "0.6s"
        }
    elif risk_score >= 0.30 or residual >= 0.20:
        return {
            "level": 3,
            "label": "DEFCON 3: STATE DRIFT DETECTED",
            "color": "#f59e0b",
            "pulse_speed": "1.5s"
        }
    return {
        "level": 5,
        "label": "DEFCON 5: NOMINAL DYNAMICS",
        "color": "#10b981",
        "pulse_speed": "0s"
    }

def map_mitre_and_remediate(top_drifted: list, risk_score: float, residual: float):
    """
    Maps top residual deviations to MITRE ATT&CK stages and generates active firewall rules.
    """
    top_names = [f["feature"] for f in top_drifted[:3]]
    
    if risk_score < 0.30 and residual < 0.20:
        return {
            "mitre": {
                "tactic": "Normal Operations",
                "technique": "Baseline Telemetry",
                "technique_id": "N/A",
                "severity": "LOW",
                "stage_idx": 0
            },
            "rule": "N/A - Network in equilibrium",
            "projected_stage": "Normal Operations",
            "projected_stage_idx": 0
        }
    
    # 1. Reconnaissance (T1595)
    if any(k in top_names for k in ["Fwd IAT Mean", "Bwd IAT Mean", "SYN Flag Cnt"]) and ("TotLen Fwd Pkts" not in top_names):
        return {
            "mitre": {
                "tactic": "Reconnaissance (TA0043)",
                "technique": "Active Scanning / Port Probing",
                "technique_id": "T1595.001",
                "severity": "MEDIUM",
                "stage_idx": 0
            },
            "rule": "iptables -A INPUT -p tcp --tcp-flags SYN,ACK,FIN,RST RST -m limit --limit 2/s -j ACCEPT",
            "projected_stage": "Initial Access (TA0001)",
            "projected_stage_idx": 1
        }
    
    # 2. Exfiltration (T1048)
    elif any(k in top_names for k in ["TotLen Fwd Pkts", "Flow Byts/s"]) and ("SYN Flag Cnt" not in top_names):
        return {
            "mitre": {
                "tactic": "Exfiltration (TA0010)",
                "technique": "Exfiltration Over Alternative Protocol",
                "technique_id": "T1048",
                "severity": "HIGH",
                "stage_idx": 4
            },
            "rule": "iptables -A OUTPUT -p tcp -m connbytes --connbytes 10000000: --connbytes-dir original --connbytes-mode bytes -j DROP",
            "projected_stage": "Impact (TA0040)",
            "projected_stage_idx": 4
        }
    
    # 3. Initial Access / Volumetric Flood (T1498)
    elif any(k in top_names for k in ["Flow Pkts/s", "Tot Fwd Pkts", "Tot Bwd Pkts"]):
        return {
            "mitre": {
                "tactic": "Initial Access / Impact (TA0040)",
                "technique": "Network Denial of Service (SYN Flood)",
                "technique_id": "T1498.001",
                "severity": "CRITICAL",
                "stage_idx": 1
            },
            "rule": "iptables -A INPUT -p tcp --syn -m connlimit --connlimit-above 50 -j DROP",
            "projected_stage": "Lateral Movement (TA0008)",
            "projected_stage_idx": 2
        }
    
    # 4. Zero-Day Temporal Anomaly
    return {
        "mitre": {
            "tactic": "Zero-Day Infiltration (TA0001)",
            "technique": "Unclassified Temporal Transition Violation",
            "technique_id": "T1190",
            "severity": "CRITICAL",
            "stage_idx": 2
        },
        "rule": "iptables -A INPUT -m state --state INVALID -j DROP && tc qdisc add dev eth0 root tbf rate 1mbit burst 32kbit latency 400ms",
        "projected_stage": "Exfiltration (TA0010)",
        "projected_stage_idx": 4
    }