# Deployment on Mainnet

## Pre-Deployment Checklist for Smart Contracts (Testnet → Mainnet)

Deploying a smart contract to the mainnet is an **irreversible action**. Once deployed, your contract will hold real user funds and interact with production systems. A poorly prepared deployment can lead to **exploits, lost funds, or unaffordable gas costs**.

This checklist highlights **security practices, performance optimisation, and deployment readiness** that every developer should follow.

***

### 1. Security Review

#### &#x20;Smart Contract Audit

* **Internal Review**: Peer-review the code within your team.
* **Automated Analysis**: Run tools like Slither, MythX, Echidna, and Foundry fuzzing.
* **Third-Party Audit**: For production-grade contracts handling funds.

### Common Attack Vectors

* Reentrancy (`ReentrancyGuard`, CEI pattern).
* Integer overflow/underflow (Solidity ^0.8.x auto-checks).
* Front-running / MEV (commit-reveal, off-chain signing).
* Denial of service (avoid unbounded loops/external calls in critical paths).
* Access control (`Ownable`, `AccessControl`).
* External calls (assume they may fail/be malicious).
* Upgrade safety (UUPS, Transparent Proxy, secure initialisers).
* Dangerous opcodes (`selfdestruct`, `delegatecall`) → avoid or restrict.

***

### 2. Gas Optimisation & Efficiency

* Minimize storage writes (most expensive op).
* Use `calldata` over `memory` for external function params.
* Emit minimal **events**.
* Pack variables into single storage slots.
* Use `immutable` / `constant` wisely.
* Cache repeated computations.
* Prefer mappings for sparse lookups.
* Ensure bounded loops.
* Enable optimiser (`--optimize --optimize-runs=200` or higher).

***

### 3. Testing & Simulation

* **Unit Tests**: Cover normal + edge cases, reverts, max values.
* **Integration Tests**: Full user flows (deposit, withdraw, admin, pause).
* **Fuzzing/Property Testing**: Invariants (`balance ≤ totalSupply`).
* **Mainnet Fork Testing**: Run simulations against real mainnet state.

***

### 4. Deployment Preparation

* Double-check constructor args (e.g., token supply, addresses).
* Keep secrets in environment variables.
* Automate with Hardhat/Foundry scripts (no manual deploy).
* Verify gas fits in the block gas limit.
* Maintain an **address book** of deployed contracts.
* Tag deployment commit in version control.

***

### 5. Post-Deployment Checklist

* Verify source code on explorer (Etherscan/MSTScan).
* Transfer ownership to multisig (e.g., Gnosis Safe).
* Enable monitoring of events/txs.
* Test `Pausable` or emergency features.
* Launch bug bounty.
* Define upgrade governance process (if proxy).

***

### 6. Documentation & Transparency

* Write a clear README for devs + users.
* Document admin roles & privileges.
* Publish audits and known risks.
* Share gas benchmarks for major functions.

***

### 7. Deployment Mindset

* Treat testnet like mainnet.
* Expect malicious actors immediately.
* Minimise trust assumptions.
* Design for long-term maintainability.

***

### 8. Configure Mainnet RPC & Network

When moving from testnet to mainnet, update your deployment environment to use the **mainnet RPC URL and chain settings**.

#### Hardhat `hardhat.config.js`:

```javascript
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    testnet: {
      url: "https://testnetrpc.mstblockchain.com",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 91562037
    },
    mainnet: {
      url: "https://mariorpc.mstblockchain.com",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 4646, 
      gasPrice: "auto", // or specify manually if needed
    },
  },
};
```

#### Foundry `foundry.toml`:

```toml
[rpc_endpoints]
testnet = "https://testnetrpc.mstblockchain.com"
mainnet = "https://mariorpc.mstblockchain.com"

[profile.default]
src = "src"
out = "out"
libs = ["lib"]
```

#### Deployment Steps

1. Ensure your wallet has enough **native tokens** on mainnet for gas fees.
2. Update `.env` with your **mainnet private key** (never hardcode).
3. Run deployment command:

   ```bash
   npx hardhat run scripts/deploy.js --network mainnet
   ```

   or

   ```bash
   forge script script/Deploy.s.sol --rpc-url mainnet --broadcast
   ```

***

With this setup, you’ll be fully ready to transition your contracts from **testnet → mainnet** in a secure, optimised, and reliable way.

After deployment, you can verify your smart contract on Block Explorer. [Learn how to verify your smart contract](https://docs.blockscout.com/devs/verification).
