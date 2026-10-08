---
name: veltrix-blockchain
description: >-
  Use this skill when implementing Web3 features, NFT subscription plans,
  smart contracts, or blockchain-based credential security for Veltrix.
---

# Veltrix Blockchain & NFT Skill

## Overview
Veltrix utilizes Web3 and blockchain technology for transparent, decentralized access control and security. It serves two main purposes:
1. **NFT Subscription Plans** — SaaS access tiers are minted and held as NFTs in the user's wallet.
2. **Credential Security** — Blockchain-based secure credential storage, verification, and auditability.

## NFT Subscription Tiers
| Tier | Name | Features | Price |
|------|------|----------|-------|
| 1 | **Explorer** | Up to 5 monitored systems, basic recovery playbooks, email notifications | Free / Low |
| 2 | **Guardian** | Up to 25 systems, advanced playbooks, team coordination, API access | Mid |
| 3 | **Sentinel** | Unlimited systems, LLM-powered autonomous recovery, custom playbooks, priority support | Premium |
| 4 | **Enterprise** | Custom deployment, SLA guarantees, dedicated 24/7 support, white-label options | Custom |

## Smart Contract Architecture
- `contracts/VeltrixNFT.sol` — ERC-721 implementation for the subscription NFT. Handles minting, burning, and tier metadata.
- `contracts/VeltrixAccess.sol` — Access control logic. Verifies if a user's wallet holds the required NFT tier for a specific platform action.
- `contracts/VeltrixCredentials.sol` — Manages cryptographic hashes and verification logic for decentralized credential security.
- `contracts/VeltrixAudit.sol` — (Optional) On-chain ledger for critical infrastructure recovery events to prove compliance.

## Web3 Integration Points
- **Wallet Connection**: Support for MetaMask, WalletConnect, and Coinbase Wallet (via wagmi/viem).
- **Minting UI**: Frontend flows for purchasing or upgrading subscription NFTs.
- **Token Gating**: Backend middleware that verifies NFT ownership before allowing access to premium API routes.
- **Credential Storage**: Transactions that write credential hashes or ZK-proofs to the blockchain.
- **Audit Trails**: Recording critical recovery playbook executions on-chain for immutable compliance logging.

## Testing Standards
- Use **Hardhat** or **Foundry** for local blockchain simulation and contract testing.
- Write exhaustive unit tests for all smart contract functions (especially edge cases in minting/burning).
- Integration test frontend wallet connection flows and state changes.
- End-to-end test the token-gating mechanism: mint NFT -> access premium route -> transfer NFT -> lose access.
- Ensure gas optimization is considered for all write operations.
