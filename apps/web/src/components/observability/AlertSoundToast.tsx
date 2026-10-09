import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VolumeX, Volume2, Flame, CheckCircle2, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface AlertSoundToastProps {
  className?: string;
  isOpen: boolean;
  nodeName: string;
  nodeId?: string;
  incidentId?: string;
  isSounding: boolean;
  isSilenced: boolean;
  autoRemediate: boolean;
  isResolved?: boolean;
  onStopAlert: () => void;
  onDismiss?: () => void;
}

export const AlertSoundToast: React.FC<AlertSoundToastProps> = ({
  className,
  isOpen,
  nodeName,
  nodeId,
  incidentId,
  isSounding,
  isSilenced,
  autoRemediate,
  isResolved = false,
  onStopAlert,
  onDismiss,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[899] flex items-center justify-center p-4 pointer-events-none">
          <motion.div
            role="alert"
            aria-live="assertive"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'pointer-events-auto w-[calc(100vw-2rem)] max-w-[420px]',
              'p-5 rounded-2xl bg-[#FFF8F0] border-2 border-[#1A1A1A]',
              'shadow-[6px_6px_0px_#1A1A1A] font-sans space-y-3.5',
              className
            )}
          >
          {/* Header Row: Title & Close Button */}
          <div className="flex items-center justify-between gap-2 border-b border-[#E8DAC8] pb-2">
            <div className="flex items-center gap-2">
              <div className="relative flex h-3 w-3">
                {isSounding && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                )}
                <span
                  className={cn(
                    'relative inline-flex rounded-full h-3 w-3',
                    isResolved ? 'bg-emerald-600' : 'bg-red-600'
                  )}
                />
              </div>
              <h4 className="text-xs sm:text-sm font-black text-[#1A1A1A] uppercase tracking-wider flex items-center gap-1.5">
                <Flame className={cn('w-4 h-4', isResolved ? 'text-emerald-600' : 'text-red-600 animate-pulse')} />
                <span>{isResolved ? 'Failure Resolved' : 'Alert: Node Failure'}</span>
              </h4>
            </div>

            {onDismiss && (
              <button
                onClick={onDismiss}
                className="p-1 rounded-lg text-stone-500 hover:text-[#1A1A1A] hover:bg-[#F2E5D5] transition-colors cursor-pointer"
                title="Dismiss toast"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Node Failure Details */}
          <div className="space-y-1 text-xs">
            <div className="text-[#5A4E44]">
              Target: <strong className="text-[#1A1A1A] font-bold">{nodeName}</strong>
              {nodeId && <span className="font-mono text-[10px] text-[#8A7B6D] ml-1">({nodeId})</span>}
            </div>
            {incidentId && (
              <div className="text-[11px] font-mono text-[#6E6258]">
                Incident ID: <strong>{incidentId}</strong>
              </div>
            )}
            <div className="text-[11px] font-mono font-bold pt-0.5">
              {isResolved ? (
                <span className="text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Cluster Restored to Nominal State</span>
                </span>
              ) : isSounding ? (
                <span className="text-red-600 flex items-center gap-1">
                  <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                  <span>Audio Siren Active (/alert.mp3)</span>
                </span>
              ) : (
                <span className="text-stone-600 flex items-center gap-1">
                  <VolumeX className="w-3.5 h-3.5 text-stone-500" />
                  <span>Audio Siren Silenced by Operator</span>
                </span>
              )}
            </div>
          </div>

          {/* Primary Action Button: Stop Alert */}
          {!isResolved && (
            <div>
              {isSounding ? (
                <button
                  onClick={onStopAlert}
                  className="w-full py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider text-white bg-red-600 hover:bg-red-700 active:translate-x-0.5 active:translate-y-0.5 border-2 border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  title="Stop the alert sound tune immediately"
                >
                  <VolumeX className="w-4 h-4" />
                  <span>Stop Alert</span>
                </button>
              ) : (
                <div className="w-full py-2 px-3 rounded-xl font-bold text-xs bg-[#FAF3EA] text-stone-600 border border-[#E5D7C5] flex items-center justify-center gap-1.5">
                  <VolumeX className="w-3.5 h-3.5 text-stone-500" />
                  <span>Alert Sound Stopped</span>
                </div>
              )}
            </div>
          )}

          {/* Remediation Workflow Notice */}
          <div className="pt-2 border-t border-[#E8DAC8] flex items-center justify-between text-[10px] font-mono text-[#6E6258]">
            <span>Remedy Workflow:</span>
            <span className="font-bold text-[#0047AB]">
              {isResolved
                ? 'Completed (100% Green)'
                : autoRemediate
                ? 'AI SRE Autonomous Self-Healing...'
                : 'Awaiting Operator Trigger'}
            </span>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
  );
};
