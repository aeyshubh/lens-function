import "dotenv/config";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { ProxyAgent, setGlobalDispatcher } from 'undici';

if (process.env.http_proxy || process.env.https_proxy) {
  const proxy = (process.env.http_proxy || process.env.https_proxy)!;
  const proxyAgent = new ProxyAgent(proxy);
  setGlobalDispatcher(proxyAgent);
}

// If not set, it uses the hardhat account 0 private key.
const DEPLOYER_PRIVATE_KEY =
  process.env.DEPLOYER_PRIVATE_KEY ?? "0x213eceff240bafe9aa76abe80856dfc217c0b6688b70f2fa7f4bfc6099abe98a";
// Get a free POLYGONSCAN_API_KEY at https://polygonscan.com.
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY || '';

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  networks: {
    polygon: {
      // If not set, you can get your own Alchemy API key at https://dashboard.alchemyapi.io or https://infura.io
      url:'https://polygon.llamarpc.com',
      accounts: [DEPLOYER_PRIVATE_KEY],
    },
    mumbai: {
      // If not set, you can get your own Alchemy API key at https://dashboard.alchemyapi.io or https://infura.io
      url: process.env.MUMBAI_RPC_URL ?? '',
      accounts: [DEPLOYER_PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: POLYGONSCAN_API_KEY,
  },
};

export default config;
