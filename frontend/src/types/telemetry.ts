export interface DefconState {
  level: number;
  label: string;
  color: string;
  pulse_speed: string;
}

export interface TelemetryMetrics {
  risk_score: number;
  residual_error: number;
  is_attack_ground_truth: number;
  anomaly_flag: boolean;
}

export interface TrajectorySplit {
  current_observed_val: number;
  current_predicted_val: number;
  divergence_delta: number;
}

export interface KillChainState {
  current_stage: string;
  current_stage_idx: number;
  projected_stage: string;
  projected_stage_idx: number;
  progression_confidence: number;
}

export interface BenchmarkMetrics {
  inference_latency_ms: number;
  throughput_wps: number;
  ram_usage_mb: number;
}

export interface FeatureDeviation {
  feature: string;
  drift: number;
}

export interface MitreAttribution {
  tactic: string;
  technique: string;
  technique_id: string;
  severity: string;
}

export interface SoarAction {
  rule_generated: string;
  timestamp: string;
}

export interface TelemetryPayload {
  timestamp_idx: number;
  defcon: DefconState;
  metrics: TelemetryMetrics;
  trajectory_split: TrajectorySplit;
  kill_chain_meter: KillChainState;
  k_step_forecast: {
    horizon_seconds: number;
    projected_risks: number[];
  };
  benchmarks: BenchmarkMetrics;
  observed_features: Record<string, number>;
  predicted_features: Record<string, number>;
  feature_deviations: FeatureDeviation[];
  mitre_attribution: MitreAttribution;
  soar_action: SoarAction;
}