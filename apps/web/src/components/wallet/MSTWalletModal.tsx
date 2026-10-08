import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { mstBlockchain, type WalletState, MST_CONFIG } from '../../engine/mstBlockchain';
import {
  Wallet,
  ShieldCheck,
  CheckCircle2,
  Copy,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

interface MSTWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MSTWalletModal: React.FC<MSTWalletModalProps> = ({ isOpen, onClose }) => {
  const [walletState, setWalletState] = useState<WalletState | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [signStatus, setSignStatus] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const loadWallet = async () => {
    setLoading(true);
    setErrorStatus(null);
    try {
      const state = await mstBlockchain.getOperatorWalletState();
      setWalletState(state);
    } catch (err: any) {
      setErrorStatus(err.message || 'Failed to query MST operator wallet from RPC.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadWallet();
    }
  }, [isOpen]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConnectBridgeKey = async () => {
    try {
      setLoading(true);
      setErrorStatus(null);
      const state = await mstBlockchain.connectBridgeKeyWallet();
      setWalletState(state);
    } catch (err: any) {
      setErrorStatus(err.message || 'Failed to connect BridgeKey Wallet.');
    } finally {
      setLoading(false);
    }
  };

  const handleTestSign = async () => {
    if (!walletState?.address) return;
    setSignStatus('Signing cryptographic verification on MST Testnet...');
    setErrorStatus(null);
    try {
      const res = await mstBlockchain.signApprovalGate({
        incidentId: 'MST-PING-AUTH',
        stepTitle: 'BridgeKey Approval Verification',
        targetService: 'db-primary',
        commanderAddress: walletState.address,
      });
      setSignStatus(`Signature Verified: ${res.hash}`);
      setTimeout(() => setSignStatus(null), 5000);
    } catch (err: any) {
      setErrorStatus(err.message || 'Sign verification failed');
      setSignStatus(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="BridgeKey Wallet — MST Blockchain Testnet">
      <div className="space-y-5">
        {/* Network & Live Connection Status */}
        <div className="p-4 rounded-xl bg-blue-500/[0.08] border border-blue-500/25 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-[#1E6BFF] flex items-center justify-center border border-blue-500/30">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[#FFF8F0]">
                {MST_CONFIG.chainName}
              </h4>
              <p className="text-[10px] font-mono text-[#A3ADC2]">
                Chain ID: {MST_CONFIG.chainId} &bull; RPC: testnetrpc.mstblockchain.com
              </p>
            </div>
          </div>
          <Badge status={walletState?.isAuthorized ? 'healthy' : 'warning'}>
            {walletState?.isAuthorized ? 'BridgeKey Authorized' : 'Connecting'}
          </Badge>
        </div>

        {errorStatus && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorStatus}</span>
          </div>
        )}

        {/* Live Balance & Commander Card */}
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#A3ADC2]">
              Operator Commander Balance
            </span>
            <button
              onClick={loadWallet}
              className="p-1 rounded text-[#A3ADC2] hover:text-[#FFF8F0] transition-colors"
              title="Refresh Balance"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-[#FFF8F0]">
              {loading ? '...' : walletState?.balanceMst || '0.0000'}
            </span>
            <span className="text-xs font-mono font-bold text-blue-400">MST</span>
            <span className="ml-auto text-[10px] text-emerald-400 font-mono">
              &gt; {MST_CONFIG.minBalance} MST Required
            </span>
          </div>

          {walletState?.address && (
            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs">
              <span className="font-mono text-[#A3ADC2] truncate max-w-[220px]">
                {walletState.address}
              </span>
              <button
                onClick={() => handleCopy(walletState.address)}
                className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Authorized Multi-Signer Addresses */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-[#FFF8F0] block">
            Authorized Commander Keypairs:
          </span>
          {MST_CONFIG.authorizedAddresses.map((addr, idx) => (
            <div
              key={addr}
              className="p-2 rounded-lg bg-black/40 border border-white/[0.05] text-[11px] font-mono flex items-center justify-between"
            >
              <span className="text-[#A3ADC2] truncate max-w-[280px]">
                {idx + 1}. {addr}
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">
                {idx === 0 ? 'Primary Commander' : 'Authorized Signer'}
              </span>
            </div>
          ))}
        </div>

        {/* Test Sign Verification Status */}
        {signStatus && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">{signStatus}</span>
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={handleTestSign}
            disabled={loading || !walletState?.isAuthorized}
            className="w-full text-xs gap-1.5 font-semibold"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verify BridgeKey Signature</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleConnectBridgeKey}
            disabled={loading}
            className="w-full text-xs gap-1.5"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-blue-400" />}
            <span>Connect BridgeKey Wallet</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
};
