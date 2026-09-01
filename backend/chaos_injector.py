import numpy as np

ATTACK_PROFILES = {
    "syn_flood": {
        "name": "TCP SYN Flood (Volumetric)",
        "mitre_id": "T1498.001",
        "overrides": {
            "SYN Flag Cnt": 0.95,
            "Flow Pkts/s": 0.88,
            "Tot Fwd Pkts": 0.90,
            "ACK Flag Cnt": 0.02
        }
    },
    "slowloris": {
        "name": "Slowloris App-Layer Exhaustion",
        "mitre_id": "T1499.003",
        "overrides": {
            "Flow Duration": 0.95,
            "Fwd IAT Mean": 0.92,
            "Flow Byts/s": 0.01,
            "TotLen Fwd Pkts": 0.04
        }
    },
    "port_scan": {
        "name": "Fast TCP PortScan / Recon",
        "mitre_id": "T1595.001",
        "overrides": {
            "Tot Fwd Pkts": 0.78,
            "Flow Duration": 0.01,
            "TotLen Fwd Pkts": 0.01,
            "SYN Flag Cnt": 0.85
        }
    },
    "data_exfil": {
        "name": "High-Volume Data Exfiltration",
        "mitre_id": "T1048",
        "overrides": {
            "TotLen Fwd Pkts": 0.98,
            "Flow Byts/s": 0.96,
            "Tot Fwd Pkts": 0.88,
            "Tot Bwd Pkts": 0.04
        }
    }
}

def inject_attack(feature_vector: np.ndarray, feature_cols: list, attack_type: str):
    """
    Applies mathematically realistic attack perturbation to the target telemetry vector.
    """
    if attack_type not in ATTACK_PROFILES:
        return feature_vector, None
    
    modified = feature_vector.copy()
    profile = ATTACK_PROFILES[attack_type]
    for feat_name, target_val in profile["overrides"].items():
        if feat_name in feature_cols:
            idx = feature_cols.index(feat_name)
            modified[idx] = float(target_val)
            
    return modified, profile