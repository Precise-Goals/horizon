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
      <Card className="p-6 skeuo-card border-[#E5D7C5]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#EADCC9]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#0047AB]/10 border border-[#0047AB]/25 text-[#0047AB] flex items-center justify-center shadow-inner">
              <RotateCcw className={`w-5 h-5 ${job?.status === 'RUNNING' ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#1A1A1A] tracking-tight">
                  Autonomous Recovery Orchestrator
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#0047AB]/10 text-[#0047AB] border border-[#0047AB]/25 font-bold">
                  {job?.id || 'INC-ACTIVE'}
                </span>
              </div>
              <p className="text-xs text-[#6E6258] mt-0.5 font-medium">
                Target: <span className="text-[#1A1A1A] font-bold">{job?.targetNodeName}</span> &bull; Blast Radius: {job?.blastRadius.length} Downstream Nodes &bull; Strategy: Kahn's Bottom-Up Sort
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Live Stopwatch Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl skeuo-well text-xs font-mono">
              <Clock className="w-3.5 h-3.5 text-[#0047AB]" />
              <span className={job?.status === 'RUNNING' ? 'text-[#0047AB] font-black animate-pulse' : 'text-[#1A1A1A] font-black'}>
                {elapsedSeconds.toFixed(1)}s
              </span>
              <span className="text-[10px] text-[#8A7B6D] font-bold">RTO</span>
            </div>

            <Badge
              status={isCompleted ? 'healthy' : isAwaitingApproval ? 'warning' : 'recovering'}
              pulse={!isCompleted}
            >
              {isCompleted ? 'Recovery Complete' : isAwaitingApproval ? 'Approval Gate Paused' : 'Executing Playbook'}
            </Badge>

            <Button variant="secondary" size="sm" onClick={handleReset} className="gap-1.5 text-xs font-semibold">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </Button>
          </div>
        </div>

        {/* Dynamic Node Failure Selector Strip */}
        <div className="py-4 border-b border-[#EADCC9] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#8A7B6D] uppercase font-bold">Test Any Node:</span>
            <div className="flex flex-wrap gap-1.5">
              {nodes.slice(0, 6).map((node) => (
                <button
                  key={node.id}
                  onClick={() => handleLaunchTargetRecovery(node.id)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer border font-semibold ${
                    job?.targetNodeId === node.id
                      ? 'bg-[#0047AB] text-white border-[#003380] shadow-sm'
                      : 'bg-[#FAF3EA] text-[#403830] border-[#E5D7C5] hover:bg-[#F4EBE0] hover:text-[#1A1A1A]'
                  }`}
                >
                  {node.id}
                </button>
              ))}
            </div>
          </div>

          <Link
            to="/architect"
            className="text-[11px] font-mono text-[#0047AB] hover:underline transition-colors flex items-center gap-1 font-bold"
          >
            <Sparkles className="w-3 h-3 text-[#0047AB]" />
            <span>Design Custom Topology in AI Architect &rarr;</span>
          </Link>
        </div>

        {/* Vertical Stepper Timeline */}
        <div className="mt-8 space-y-6 relative before:absolute before:inset-0 before:left-5 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[#0047AB]/60 before:via-[#D9C8B5] before:to-transparent">
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
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-400 shadow-sm'
                      : isCurrent
                      ? 'bg-[#0047AB] text-white border-[#003380] shadow-md shadow-[#0047AB]/30 scale-110 animate-pulse'
                      : isWaiting
                      ? 'bg-amber-50 text-amber-800 border-amber-400 shadow-sm ring-2 ring-amber-400/20'
                      : 'bg-[#F4EBE0] text-[#8A7B6D] border-[#D9C8B5]'
                  }`}
                >
                  {isDone ? (
                    <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                  ) : isWaiting ? (
                    <ShieldAlert className="w-4 h-4 text-amber-600 stroke-[2.5]" />
                  ) : (
                    step.id
                  )}
                </div>

                {/* Step Details Glass Card */}
                <div
                  className={`flex-1 p-5 rounded-2xl border transition-all duration-200 ${
                    isCurrent || isWaiting
                      ? 'bg-white border-[#0047AB]/40 shadow-md ring-2 ring-[#0047AB]/10'
                      : isDone
                      ? 'bg-[#FAF3EA] border-[#E5D7C5]'
                      : 'bg-[#FAF3EA]/60 border-[#EADCC9] opacity-70'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#1A1A1A]">
                        {step.title}
                      </span>
                      {step.isHighRisk && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 font-bold">
                          BridgeKey Gate
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-[#8A7B6D] font-medium">
                        {step.service}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                          isDone
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : isWaiting
                            ? 'bg-amber-50 text-amber-800 border border-amber-300 animate-pulse'
                            : isCurrent
                            ? 'bg-blue-50 text-[#0047AB] border border-blue-200'
                            : 'bg-stone-100 text-[#8A7B6D]'
                        }`}
                      >
                        {step.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#5A4E44] mb-3 font-medium">{step.action}</p>

                  {/* Terminal Execution Log (Recessed Inset Display) */}
                  <div className="p-3 rounded-xl bg-[#1A1A1A] border border-black shadow-inner flex items-start gap-2 text-[11px] font-mono text-emerald-400">
                    <Terminal className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                    <span className="break-all">{step.log}</span>
                  </div>

                  {/* Active Approval Gate Action Trigger - Cobalt Blue Patch */}
                  {isWaiting && (
                    <div className="mt-3.5 p-4 rounded-xl cobalt-patch shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white">
                      <div className="flex items-center gap-2 text-xs">
                        <KeyRound className="w-4 h-4 shrink-0 text-amber-300" />
                        <span className="font-medium">Requires Commander EIP-712 Cryptographic Signature on MST Testnet (91562037)</span>
                      </div>

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleApproveGate}
                        disabled={isSigning}
                        className="gap-2 text-xs font-bold rounded-xl shadow-md bg-white text-[#0047AB] hover:bg-stone-100 border-white shrink-0"
                      >
                        <ShieldCheck className={`w-3.5 h-3.5 text-[#0047AB] ${isSigning ? 'animate-spin' : ''}`} />
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
          <div className="mt-8 p-5 rounded-2xl bg-emerald-50 border border-emerald-300/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center shadow-inner">
                <Check className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-950">
                  Autonomous Recovery Verified & Closed
                </h4>
                <p className="text-xs text-emerald-800 mt-0.5 font-medium">
                  Cluster restored in {elapsedSeconds.toFixed(1)}s &bull; Merkle audit root anchored on MST Blockchain.
                </p>
              </div>
            </div>

            <Link to="/audit">
              <Button variant="secondary" size="sm" className="gap-1.5 text-xs font-bold">
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
