const hre = require("hardhat");

async function main() {
  console.log("Deploying Horizon smart contracts to MST Testnet (Chain ID 91562037)...");

  // 1. Deploy HorizonSubscriptionNFT
  const SubscriptionNFT = await hre.ethers.getContractFactory("HorizonSubscriptionNFT");
  const subscriptionNFT = await SubscriptionNFT.deploy();
  await subscriptionNFT.waitForDeployment();
  const subAddress = await subscriptionNFT.getAddress();
  console.log(`HorizonSubscriptionNFT deployed to: ${subAddress}`);

  // 2. Deploy HorizonAuditVault
  const AuditVault = await hre.ethers.getContractFactory("HorizonAuditVault");
  const auditVault = await AuditVault.deploy();
  await auditVault.waitForDeployment();
  const vaultAddress = await auditVault.getAddress();
  console.log(`HorizonAuditVault deployed to: ${vaultAddress}`);

  console.log("\nDeployment complete!");
  console.log(`VITE_NFT_SUBSCRIPTION_CONTRACT=${subAddress}`);
  console.log(`VITE_AUDIT_VAULT_CONTRACT=${vaultAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
