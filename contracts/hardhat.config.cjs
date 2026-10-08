require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {},
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    mstTestnet: {
      url: process.env.MST_TESTNET_RPC || "https://rpc.mainnet.mst.today",
      chainId: 91562037,
      accounts: process.env.OPERATOR_PRIVATE_KEY ? [process.env.OPERATOR_PRIVATE_KEY] : []
    }
  }
};
