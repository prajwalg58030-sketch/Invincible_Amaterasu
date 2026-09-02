export interface DefconState {
  level: number;
  label: string;
  color: string;
}

export interface BenchmarkMetrics {
  inference_latency_ms?: number;
  latency_ms?: number;
  throughput_wps?: number;
  ram_usage_mb?: number;
  ram_mb?: number;
}

export interface MetricValues {
  risk_score: number;
  residual_error: number;
  is_attack_ground_truth: number;
  anomaly_flag: boolean;
}

export interface TrajectorySplit {
  tracked_feature?: string;
  current_observed_val: number;
  current_predicted_val: number;
  divergence_delta: number;
}

export interface KillChainMeterState {
  current_stage: string;
  current_stage_idx: number;
  projected_stage: string;
  projected_stage_idx: number;
  progression_confidence: number;
}

export interface KStepForecast {
  horizon_seconds: number;
  projected_risks: number[];
}

export interface FeatureDeviation {
  feature: string;
  deviation: number;
}

export interface MitreAttribution {
  tactic: string;
  technique_id: string;
  technique_name: string;
  stage_idx: number;
  mitre_ref?: string;
  description: string;
}

export interface SoarAction {
  rule_generated: string;
  timestamp: string;
}

export interface TelemetryPayload {
  timestamp_idx: number;
  defcon: DefconState;
  metrics: MetricValues;
  trajectory_split: TrajectorySplit;
  kill_chain_meter: KillChainMeterState;
  k_step_forecast: KStepForecast;
  benchmarks: BenchmarkMetrics;
  observed_features: Record<string, number>;
  predicted_features: Record<string, number>;
  feature_deviations: FeatureDeviation[];
  mitre_attribution: MitreAttribution;
  soar_action: SoarAction;
}