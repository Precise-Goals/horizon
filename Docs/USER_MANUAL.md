# Zentrix User Manual

Welcome to Zentrix, the premier on-chain freelance marketplace powered by MST Testnet. 
This manual explains how to navigate the platform, use the Escrow features, and interact with Sarvam AI.

## 1. Getting Started
1. **Connect BridgeKey Wallet**: BridgeKey is the designated multi-sig capable wallet on MST Testnet. Ensure your network is set to MST Testnet (Chain ID `91562037`).
2. **Onboarding**: Upon first connection, you will select your active role (Client or Freelancer) and complete your profile.
3. **ZentrixPass**: Visit the Pricing page to mint a ZentrixPass NFT (Scout, Builder, or Architect) which increases your AI search rate limits and enhances platform visibility.

## 2. Freelancers
- **Browse Gigs**: Navigate to the `/marketplace` to view open gigs.
- **Apply to Gigs**: Click "Apply", propose your delivery approach, and submit. Your proposal status will change to **Submitted (Locked)**.
- **Start Work**: Once a client accepts your proposal, the gig status transitions to **Active**. The escrow is locked.
- **Submit Milestones**: Go to `/dashboard`, view your active milestones, and click **Submit for Review** when you have completed the deliverable.
- **Pull Withdraw**: After the client approves a milestone, the escrow unlocks those funds to your withdrawable balance. Click **Pull Withdraw** to transfer `tMSTC` directly to your wallet.

## 3. Clients
- **Post a Gig**: Click "Post a Milestone Gig" in the `/marketplace`. Define the project title, required skills, budget, and exact milestone acceptance criteria.
- **Review Proposals**: When freelancers apply, they will appear under the gig details modal. Click **Accept Proposal & Start Work** to formally assign the freelancer and lock the smart contract escrow.
- **Approve Deliverables**: As the freelancer submits milestones, review their work. If acceptable, click **Approve Milestone** in the `/dashboard`. **This action is irreversible and unlocks funds.**
- **Dispute Resolution**: If a milestone is not met, the smart contract's auto-release window prevents immediate loss, allowing for arbitrated resolution.

## 4. AI Matchmaker
- **Sarvam 30B Agent**: Visit `/agent` to chat with our specialized AI. It will analyze your skills and automatically suggest the best matching gigs in hyperlinked card formats.
- **Rate Limits**: Daily requests are based on your ZentrixPass Tier (Free: 5, Pro: 10, Enterprise: 15).

For further assistance, use the **Contact Us** form in the Support menu.
