import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { mstBlockchain, type WalletState, MST_CONFIG } from '../../engine/mstBlockchain';
import { useAuth } from '../../context/useAuth';
import {
  Wallet,
  ShieldCheck,
  CheckCircle2,
  Copy,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  Loader2,
  ExternalLink,
  PlusCircle,
  Gem,
} from 'lucide-react';

interface MSTWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MSTWalletModal: React.FC<MSTWalletModalProps> = ({ isOpen, onClose }) => {
  const { wallet, connectBridgeKey, syncWallet } = useAuth();
  const [walletState, setWalletState] = useState<WalletState | null>(wallet);
  const [userPass, setUserPass] = useState<Awaited<ReturnType<typeof mstBlockchain.getUserPass>>>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [signStatus, setSignStatus] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [watchStatus, setWatchStatus] = useState<string | null>(null);

  const loadWallet = async () => {
    setLoading(true);
    setErrorStatus(null);
    try {
      await syncWallet();
      const active = (await mstBlockchain.checkActiveConnection()) || wallet;
      const state = active || (await mstBlockchain.getOperatorWalletState());
      setWalletState(state);

      // Query on-chain pass for this address
      const pass = await mstBlockchain.getUserPass(state.address);
      setUserPass(pass);
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
  }, [isOpen, wallet?.address]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConnectBridgeKey = async () => {
    try {
      setLoading(true);
      setErrorStatus(null);
      await connectBridgeKey();
      await syncWallet();
      const state = (await mstBlockchain.checkActiveConnection()) || wallet || (await mstBlockchain.getOperatorWalletState());
      setWalletState(state);

      const pass = await mstBlockchain.getUserPass(state.address);
      setUserPass(pass);
    } catch (err: any) {
      setErrorStatus(err.message || 'Failed to connect BridgeKey Wallet.');
    } finally {
      setLoading(false);
    }
  };

  const handleWatchNFTInWallet = async (tokenId: number = 1) => {
    setWatchStatus('Prompting BridgeKey wallet to register NFT...');
    try {
      const success = await mstBlockchain.watchAssetInWallet(tokenId);
      if (success) {
        setWatchStatus(`NFT #${tokenId} watched in BridgeKey Wallet!`);
      } else {
        setWatchStatus(
          `Request sent. If BridgeKey did not auto-import, use BridgeKey -> NFTs -> Import NFT with Contract 0x3EDad... and Token ID ${tokenId}`
        );
      }
    } catch (err: any) {
      setWatchStatus(`BridgeKey: ${err.message || 'Please open BridgeKey to approve.'}`);
    }
  };

  const handleTestSign = async () => {
    setSignStatus(null);
    setErrorStatus(null);
    try {
      const res = await mstBlockchain.signApprovalGate({
        incidentId: 'INC-MST-VERIFY',
        stepTitle: 'Verify Multi-Sig Gate',
        targetService: 'database-core',
        commanderAddress: walletState?.address || MST_CONFIG.operatorAddress,
      });
      setSignStatus(`EIP-712 Signature Verified: ${res.signature.slice(0, 14)}...${res.signature.slice(-8)}`);
    } catch (err: any) {
      setErrorStatus(err.message || 'User rejected signature or wallet unavailable.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="BridgeKey & MST Testnet Security">
      <div className="space-y-4 font-sans text-[#0A0A0A]">
        {/* Network & Chain ID Status Header */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#FAFAF9] border border-[#E5E5E5]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-white border border-[#E5E5E5] text-[#0A0A0A]">
              <Wallet className="w-4 h-4 text-[#2DD4BF]" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[#0A0A0A]">
                {MST_CONFIG.chainName}
              </h4>
              <p className="text-[10px] font-mono text-[#6B6B6B]">
                Chain ID: {MST_CONFIG.chainId} &bull; RPC: testnetrpc.mstblockchain.com
              </p>
            </div>
          </div>
          <Badge status={walletState?.isAuthorized ? 'healthy' : 'warning'}>
            {walletState?.isAuthorized ? 'BridgeKey Authorized' : 'Connecting'}
          </Badge>
        </div>

        {errorStatus && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{errorStatus}</span>
          </div>
        )}

        {/* Live Balance & Commander Card */}
        <div className="p-4 rounded-xl bg-white border border-[#E5E5E5] space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B6B6B]">
              Operator Commander Balance
            </span>
            <button
              onClick={loadWallet}
              className="p-1 rounded-full text-[#6B6B6B] hover:text-[#0A0A0A] transition-colors cursor-pointer"
              title="Refresh Balance"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-[#0A0A0A]">
              {loading ? '...' : walletState?.balanceMst || '0.0000'}
            </span>
            <span className="text-xs font-mono font-bold text-[#0A0A0A]">MST</span>
            <span className="ml-auto text-[10px] text-[#2DD4BF] font-mono font-semibold">
              &gt; {MST_CONFIG.minBalance} MST Required
            </span>
          </div>

          {walletState?.address && (
            <div className="pt-2 border-t border-[#E5E5E5] flex items-center justify-between text-xs">
              <span className="font-mono text-[#6B6B6B] truncate max-w-[220px]">
                {walletState.address}
              </span>
              <button
                onClick={() => handleCopy(walletState.address)}
                className="text-[11px] font-semibold text-[#0A0A0A] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          )}
        </div>

        {/* On-Chain Zentrix Pass NFT Collectible Section */}
        <div className="p-4 rounded-xl bg-[#FAFAF9] border border-[#E5E5E5] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gem className="w-4 h-4 text-[#2DD4BF]" />
              <span className="text-xs font-semibold text-[#0A0A0A]">
                Zentrix Pass (ZXPASS) Collectible
              </span>
            </div>
            <a
              href={`${MST_CONFIG.explorerUrl}/token/${MST_CONFIG.subscriptionContractAddress}/instance/${userPass?.tokenId || 1}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-mono font-semibold text-[#0A0A0A] hover:underline flex items-center gap-1"
            >
              <span>MSTScan Instance</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {userPass?.hasPass ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#6B6B6B]">Status:</span>
                <span className="text-[#0A0A0A] font-bold">{userPass.tierName} (#ZXPASS-{userPass.tokenId})</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#6B6B6B]">Contract:</span>
                <span className="text-[#0A0A0A] truncate max-w-[180px]">{MST_CONFIG.subscriptionContractAddress}</span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleWatchNFTInWallet(userPass.tokenId)}
                className="w-full text-xs gap-1.5 mt-2 py-2 rounded-full font-semibold"
              >
                <PlusCircle className="w-3.5 h-3.5 text-[#2DD4BF]" />
                <span>Add NFT #{userPass.tokenId} to BridgeKey Wallet (EIP-747)</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-2 text-xs">
              <div className="text-[#6B6B6B]">
                Registered Contract: <span className="text-[#0A0A0A] font-mono font-semibold">{MST_CONFIG.subscriptionContractAddress.slice(0, 10)}...{MST_CONFIG.subscriptionContractAddress.slice(-6)}</span>
              </div>
              <p className="text-[#6B6B6B] text-[11px]">
                Token #1 owner is verified on-chain. Click below to add the NFT collectible directly into your BridgeKey wallet tab:
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleWatchNFTInWallet(1)}
                className="w-full text-xs gap-1.5 py-1.5 rounded-full font-semibold"
              >
                <PlusCircle className="w-3.5 h-3.5 text-[#2DD4BF]" />
                <span>Import NFT #1 into BridgeKey Wallet</span>
              </Button>
            </div>
          )}

          {watchStatus && (
            <div className="p-2.5 rounded-lg bg-neutral-100 border border-[#E5E5E5] text-[11px] font-mono text-[#0A0A0A]">
              {watchStatus}
            </div>
          )}
        </div>

        {/* Authorized Multi-Signer Addresses */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-[#0A0A0A] block">
            Authorized Commander Keypairs:
          </span>
          {MST_CONFIG.authorizedAddresses.map((addr, idx) => (
            <div
              key={addr}
              className="p-2.5 rounded-xl bg-white border border-[#E5E5E5] text-[11px] font-mono flex items-center justify-between shadow-xs"
            >
              <span className="text-[#6B6B6B] truncate max-w-[280px]">
                {idx + 1}. {addr}
              </span>
              <span className="text-[10px] text-[#2DD4BF] font-semibold">
                {idx === 0 ? 'Primary Commander' : 'Authorized Signer'}
              </span>
            </div>
          ))}
        </div>

        {/* Test Sign Verification Status */}
        {signStatus && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
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
            className="w-full text-xs gap-1.5 font-semibold rounded-full h-11"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verify BridgeKey Signature</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleConnectBridgeKey}
            disabled={loading}
            className="w-full text-xs gap-1.5 rounded-full h-11 font-semibold"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-[#2DD4BF]" />}
            <span>Connect BridgeKey Wallet</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
};
export default MSTWalletModal;
