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
  X,
  Play,
  Sparkles,
  Server,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
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

  // Real-time stopwatch during active recovery
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

  // If no job is currently running, initialize one on db-primary or first down node for demonstration
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner & Control Deck */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[#1E6BFF]">
              <RotateCcw className={`w-5 h-5 ${job?.status === 'RUNNING' ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-[#FFF8F0] tracking-tight">
                  Autonomous Recovery Orchestrator
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 font-bold">
                  {job?.id || 'INC-ACTIVE'}
                </span>
              </div>
              <p className="text-xs text-[#A3ADC2] mt-0.5">
                Target: <span className="text-[#FFF8F0] font-semibold">{job?.targetNodeName}</span> &bull; Blast Radius: {job?.blastRadius.length} Downstream Nodes &bull; Strategy: Kahn's Bottom-Up Sort
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Live Stopwatch Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 border border-white/[0.08] text-xs font-mono">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span className={job?.status === 'RUNNING' ? 'text-blue-300 font-bold animate-pulse' : 'text-[#FFF8F0] font-bold'}>
                {elapsedSeconds.toFixed(1)}s
              </span>
              <span className="text-[10px] text-[#6E7A94]">RTO</span>
            </div>

            <Badge
              status={isCompleted ? 'healthy' : isAwaitingApproval ? 'warning' : 'recovering'}
              pulse={!isCompleted}
            >
              {isCompleted ? 'Recovery Complete' : isAwaitingApproval ? 'Approval Gate Paused' : 'Executing Playbook'}
            </Badge>

            <Button variant="secondary" size="sm" onClick={handleReset} className="gap-1.5 text-xs">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </Button>
          </div>
        </div>

        {/* Dynamic Node Failure Selector Strip */}
        <div className="py-4 border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#6E7A94] uppercase font-bold">Test Any Node:</span>
            <div className="flex flex-wrap gap-1.5">
              {nodes.slice(0, 6).map((node) => (
                <button
                  key={node.id}
                  onClick={() => handleLaunchTargetRecovery(node.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer border ${
                    job?.targetNodeId === node.id
                      ? 'bg-blue-500/20 text-[#FFF8F0] border-blue-500/40 font-bold'
                      : 'bg-white/[0.02] text-[#A3ADC2] border-white/[0.06] hover:bg-white/[0.06] hover:text-[#FFF8F0]'
                  }`}
                >
                  {node.id}
                </button>
              ))}
            </div>
          </div>

          <Link
            to="/architect"
            className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 font-semibold"
          >
            <Sparkles className="w-3 h-3" />
            <span>Design Custom Topology in AI Architect &rarr;</span>
          </Link>
        </div>

        {/* Vertical Stepper Timeline */}
        <div className="mt-8 space-y-6 relative before:absolute before:inset-0 before:left-5 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-blue-500/40 before:via-white/10 before:to-transparent">
          {steps.map((step, idx) => {
            const isCurrent = job?.currentStepIndex === idx && !isCompleted;
            const isDone = step.status === 'completed';
            const isWaiting = step.status === 'waiting_approval';

            return (
              <div key={step.id} className="relative flex items-start gap-5 pl-1">
                {/* Step Circle Indicator */}
                <div
                  className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border text-xs font-mono font-bold transition-all duration-300 ${
                    isDone
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-md shadow-emerald-500/20'
                      : isCurrent
                      ? 'bg-blue-500/25 text-[#FFF8F0] border-blue-400 shadow-lg shadow-blue-500/30 scale-110 animate-pulse'
                      : isWaiting
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md shadow-amber-500/20'
                      : 'bg-[#0D121D] text-[#6E7A94] border-white/10'
                  }`}
                >
                  {isDone ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : isWaiting ? (
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                  ) : (
                    step.id
                  )}
                </div>

                {/* Step Details Glass Card */}
                <div
                  className={`flex-1 p-4 rounded-xl border backdrop-blur-xl transition-all duration-200 ${
                    isCurrent || isWaiting
                      ? 'bg-white/[0.05] border-blue-500/40 shadow-xl shadow-black/50'
                      : isDone
                      ? 'bg-white/[0.02] border-white/[0.06] opacity-90'
                      : 'bg-white/[0.01] border-white/[0.04] opacity-50'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#FFF8F0]">
                        {step.title}
                      </span>
                      {step.isHighRisk && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/25 font-bold">
                          BridgeKey Gate
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-[#6E7A94]">
                        {step.service}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                          isDone
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : isWaiting
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                            : isCurrent
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'bg-white/[0.04] text-[#6E7A94]'
                        }`}
                      >
                        {step.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#A3ADC2] mb-2">{step.action}</p>

                  {/* Terminal Execution Log */}
                  <div className="p-2.5 rounded-lg bg-black/60 border border-white/[0.04] flex items-start gap-2 text-[11px] font-mono text-[#94A3B8]">
                    <Terminal className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                    <span className="break-all">{step.log}</span>
                  </div>

                  {/* Active Approval Gate Action Trigger */}
                  {isWaiting && (
                    <div className="mt-3 pt-3 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs text-amber-300">
                        <KeyRound className="w-4 h-4 shrink-0" />
                        <span>Requires Commander EIP-712 Cryptographic Signature on MST Testnet (91562037)</span>
                      </div>

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleApproveGate}
                        disabled={isSigning}
                        className="gap-2 text-xs font-bold rounded-xl shadow-lg shadow-blue-500/25"
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

        {/* Completion Milestone Card */}
        {isCompleted && (
          <div className="mt-8 p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#FFF8F0]">
                  Autonomous Recovery Verified & Closed
                </h4>
                <p className="text-xs text-[#A3ADC2] mt-0.5">
                  Cluster restored in {elapsedSeconds.toFixed(1)}s &bull; Merkle audit root anchored on MST Blockchain.
                </p>
              </div>
            </div>

            <Link to="/audit">
              <Button variant="secondary" size="sm" className="gap-1.5 text-xs">
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
