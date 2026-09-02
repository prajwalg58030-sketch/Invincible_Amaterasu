"use client";

import React from "react";
import { useTelemetrySocket } from "@/hooks/useTelemetrySocket";
import { DefconBorder } from "@/components/DefconBorder";
import { HeaderBar } from "@/components/HeaderBar";
import { ChaosPanel } from "@/components/ChaosPanel";
import { ThreatDiagnosisBanner } from "@/components/ThreatDiagnosisBanner";
import { TrajectoryChart } from "@/components/TrajectoryChart";
import { KillChainMeter } from "@/components/KillChainMeter";
import { FeatureRadar } from "@/components/FeatureRadar";
import { ResidualDrift } from "@/components/ResidualDrift";
import { MitigationFeed } from "@/components/MitigationFeed";

export default function DashboardPage() {
  const {
    data,
    history,
    isConnected,
    activeChaos,
    injectChaos,
    clearChaos,
    jumpScenario,
  } = useTelemetrySocket();

  return (
    <DefconBorder defcon={data?.defcon}>
      <div className="max-w-[1550px] mx-auto space-y-4">
        <HeaderBar
          defcon={data?.defcon}
          benchmarks={data?.benchmarks}
          isConnected={isConnected}
          onJump={jumpScenario}
        />

        <ChaosPanel
          activeChaos={activeChaos}
          onInject={injectChaos}
          onClear={clearChaos}
        />

        <ThreatDiagnosisBanner
          defcon={data?.defcon}
          mitre={data?.mitre_attribution}
          topDeviation={data?.feature_deviations?.[0]}
          residualError={data?.metrics?.residual_error}
          riskScore={data?.metrics?.risk_score}
          projectedRisks={data?.k_step_forecast?.projected_risks}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <TrajectoryChart history={history} />
            <KillChainMeter
              state={data?.kill_chain_meter}
              risks={data?.k_step_forecast?.projected_risks}
            />
          </div>
          <div className="space-y-4">
            <FeatureRadar
              observed={data?.observed_features}
              predicted={data?.predicted_features}
            />
            <ResidualDrift deviations={data?.feature_deviations} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <MitigationFeed
            soar={data?.soar_action}
            mitre={data?.mitre_attribution}
          />
        </div>
      </div>
    </DefconBorder>
  );
}