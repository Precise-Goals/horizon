import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { clusterState, type RecoveryJobState } from '../../engine/state';
import { mstBlockchain } from '../../engine/mstBlockchain';
import type { SystemNode } from '../../types';
import {
  RotateCcw,
  Terminal,
  ShieldAlert,
  Clock,
  KeyRound,
  Check,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router';

export const RecoveryTimeline: React.FC = () => {
  const [job, setJob] = useState<RecoveryJobState | null>(() => clusterState.getActiveJob());
  const [nodes, setNodes] = useState<SystemNode[]>(() => clusterState.getNodes());
  const [selectedTarget, setSelectedTarget] = useState<string>('db-primary');
  const [isSigning, setIsSigning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const unsub = clusterState.subscribe(() => {
      setJob(clusterState.getActiveJob());
      setNodes(clusterState.getNodes());
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!job) {
      setElapsedSeconds(0);
      return;
    }

    if (job.status === 'COMPLETED' || job.status === 'FAILED') {
      if (job.elapsedMs) {
        setElapsedSeconds(Math.round(job.elapsedMs / 100) / 10);
      }
      return;
    }

    const interval = setInterval(() => {
      setElapsedSeconds(Math.round((Date.now() - job.detectedAt) / 100) / 10);
    }, 100);
    return () => clearInterval(interval);
  }, [job?.detectedAt, job?.status, job?.elapsedMs]);

  useEffect(() => {
    if (!job) {
      const downNode = nodes.find((n) => n.status === 'down' || n.status === 'degraded');
      clusterState.startRecovery(downNode?.id || 'db-primary');
    }
  }, []);

  const handleApproveGate = async () => {
    if (!job || isSigning) return;
    setIsSigning(true);
    try {
      let walletAddress: string | undefined;
      try {
        const wallet = await mstBlockchain.connectBridgeKeyWallet();
        walletAddress = wallet?.address;
      } catch {
        const op = await mstBlockchain.getOperatorWalletState();
        walletAddress = op?.address;
      }
      await clusterState.approveGate(walletAddress);
    } catch (err) {
      console.error('Approval gate signing failed:', err);
    } finally {
      setIsSigning(false);
    }
  };

  const handleLaunchTargetRecovery = (nodeId: string) => {
    setSelectedTarget(nodeId);
    clusterState.setNodeStatus(nodeId, 'down');
    clusterState.startRecovery(nodeId);
  };

  const handleReset = () => {
    clusterState.resetRecovery();
    clusterState.startRecovery(selectedTarget);
  };

  const isCompleted = job?.status === 'COMPLETED';
  const isAwaitingApproval = job?.status === 'PAUSED_APPROVAL';
  const steps = job?.steps || [];

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Top Banner & Control Deck */}
      <Card className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.07]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[8px] bg-[#6366F1]/15 border border-[#6366F1]/25 text-[#6366F1] flex items-center justify-center">
              <RotateCcw className={`w-4 h-4 ${job?.status === 'RUNNING' ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-semibold text-[#ECECF0] tracking-tight">
                  Autonomous Recovery Orchestrator
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-[#6366F1]/15 text-[#7C7FF7] border border-[#6366F1]/25">
                  {job?.id || 'INC-ACTIVE'}
                </span>
              </div>
              <p className="text-xs text-[#A0A0AB] mt-0.5">
                Target: <span className="text-[#ECECF0] font-medium">{job?.targetNodeName}</span> &bull; Blast Radius: {job?.blastRadius.length} Downstream Nodes &bull; Strategy: Kahn's Bottom-Up Sort
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Live Stopwatch Pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] hz-well text-xs font-mono">
              <Clock className="w-3 h-3 text-[#22D3EE]" />
              <span className={job?.status === 'RUNNING' ? 'text-[#22D3EE] font-bold animate-pulse' : 'text-[#ECECF0] font-semibold'}>
                {elapsedSeconds.toFixed(1)}s
              </span>
              <span className="text-[10px] text-[#63636E]">RTO</span>
            </div>

            <Badge
              status={isCompleted ? 'healthy' : isAwaitingApproval ? 'warning' : 'recovering'}
              pulse={!isCompleted}
            >
              {isCompleted ? 'Recovery Complete' : isAwaitingApproval ? 'Approval Gate Paused' : 'Executing Playbook'}
            </Badge>

            <Button variant="secondary" size="sm" onClick={handleReset} className="gap-1 text-xs">
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </Button>
          </div>
        </div>

        {/* Dynamic Node Failure Selector Strip */}
        <div className="py-3 border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-[#63636E] uppercase">Test Node Outage:</span>
            <div className="flex flex-wrap gap-1">
              {nodes.slice(0, 6).map((node) => (
                <button
                  key={node.id}
                  onClick={() => handleLaunchTargetRecovery(node.id)}
                  className={`px-2.5 py-0.5 rounded-[5px] text-[11px] font-mono transition-all cursor-pointer border ${
                    job?.targetNodeId === node.id
                      ? 'bg-[#6366F1] text-white border-[#6366F1] shadow-sm'
                      : 'bg-white/[0.04] text-[#A0A0AB] border-white/[0.06] hover:bg-white/[0.08] hover:text-[#ECECF0]'
                  }`}
                >
                  {node.id}
                </button>
              ))}
            </div>
          </div>

          <Link
            to="/architect"
            className="text-[11px] font-mono text-[#7C7FF7] hover:text-white transition-colors flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-[#6366F1]" />
            <span>Design Custom Topology in AI Architect &rarr;</span>
          </Link>
        </div>

        {/* Vertical Stepper Timeline */}
        <div className="mt-6 space-y-5 relative before:absolute before:inset-0 before:left-4 before:h-full before:w-px before:bg-gradient-to-b before:from-[#6366F1]/50 before:via-white/[0.08] before:to-transparent">
          {steps.map((step, idx) => {
            const isCurrent = job?.currentStepIndex === idx && !isCompleted;
            const isDone = step.status === 'completed';
            const isWaiting = step.status === 'waiting_approval';

            return (
              <div key={step.id} className="relative flex items-start gap-4 pl-0.5">
                {/* Step Circle Indicator */}
                <div
                  className={`relative z-10 flex items-center justify-center w-7 h-7 rounded-full border text-xs font-mono font-medium transition-all duration-200 ${
                    isDone
                      ? 'bg-[#34D399]/15 text-[#34D399] border-[#34D399]/30'
                      : isCurrent
                      ? 'bg-[#6366F1] text-white border-[#6366F1] shadow-[0_0_12px_rgba(99,102,241,0.5)] scale-110 animate-pulse'
                      : isWaiting
                      ? 'bg-[#A78BFA]/15 text-[#A78BFA] border-[#A78BFA]/40 shadow-sm'
                      : 'bg-[#18181B] text-[#63636E] border-white/[0.08]'
                  }`}
                >
                  {isDone ? (
                    <Check className="w-3.5 h-3.5 text-[#34D399] stroke-[2.5]" />
                  ) : isWaiting ? (
                    <ShieldAlert className="w-3.5 h-3.5 text-[#A78BFA] stroke-[2]" />
                  ) : (
                    step.id
                  )}
                </div>

                {/* Step Details Card */}
                <div
                  className={`flex-1 p-4 rounded-[10px] border transition-all duration-150 ${
                    isCurrent || isWaiting
                      ? 'bg-[#18181B] border-[#6366F1]/40 shadow-[0_4px_20px_rgba(0,0,0,0.5)]'
                      : isDone
                      ? 'bg-[#141416] border-white/[0.08]'
                      : 'bg-[#141416]/50 border-white/[0.04] opacity-60'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#ECECF0]">
                        {step.title}
                      </span>
                      {step.isHighRisk && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#A78BFA]/15 text-[#A78BFA] border border-[#A78BFA]/25">
                          BridgeKey Gate
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-[#63636E]">
                        {step.service}
                      </span>
                      <span
                        className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded ${
                          isDone
                            ? 'bg-[#34D399]/10 text-[#34D399] border border-[#34D399]/25'
                            : isWaiting
                            ? 'bg-[#A78BFA]/15 text-[#A78BFA] border border-[#A78BFA]/30 animate-pulse'
                            : isCurrent
                            ? 'bg-[#6366F1]/15 text-[#7C7FF7] border border-[#6366F1]/25'
                            : 'bg-white/[0.04] text-[#63636E]'
                        }`}
                      >
                        {step.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#A0A0AB] mb-2.5">{step.action}</p>

                  {/* Terminal Execution Log */}
                  <div className="p-2.5 rounded-[6px] bg-[#101012] border border-white/[0.06] flex items-start gap-2 text-[11px] font-mono text-[#34D399]">
                    <Terminal className="w-3 h-3 text-[#22D3EE] mt-0.5 shrink-0" />
                    <span className="break-all">{step.log}</span>
                  </div>

                  {/* Active Approval Gate Action Trigger */}
                  {isWaiting && (
                    <div className="mt-3 p-3.5 rounded-[8px] bg-[#1A1829] border border-[#A78BFA]/35 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[#ECECF0]">
                      <div className="flex items-center gap-2 text-xs">
                        <KeyRound className="w-4 h-4 shrink-0 text-[#A78BFA]" />
                        <span className="text-xs">Requires Commander EIP-712 Cryptographic Signature on MST Testnet (Chain 91562037)</span>
                      </div>

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleApproveGate}
                        disabled={isSigning}
                        className="gap-1.5 text-xs px-3 py-1.5 bg-[#A78BFA] hover:bg-[#BCA4FC] text-black border-transparent shrink-0 font-medium"
                      >
                        <ShieldCheck className={`w-3.5 h-3.5 ${isSigning ? 'animate-spin' : ''}`} />
                        <span>{isSigning ? 'Validating MST Signature...' : 'Authorize via BridgeKey'}</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Completion Milestone Banner */}
        {isCompleted && (
          <div className="mt-6 p-4 rounded-[10px] bg-[#34D399]/10 border border-[#34D399]/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[6px] bg-[#34D399]/20 border border-[#34D399]/30 text-[#34D399] flex items-center justify-center shrink-0">
                <Check className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-[#ECECF0]">
                  Autonomous Recovery Verified & Closed
                </h4>
                <p className="text-[11px] text-[#A0A0AB] mt-0.5">
                  Cluster restored in {elapsedSeconds.toFixed(1)}s &bull; Merkle audit root proof anchored on MST Blockchain.
                </p>
              </div>
            </div>

            <Link to="/audit">
              <Button variant="secondary" size="sm" className="gap-1 text-xs">
                <span>View On-Chain Audit Vault &rarr;</span>
              </Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
};
export default RecoveryTimeline;
