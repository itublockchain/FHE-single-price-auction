import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";
import "hardhat-deploy";
import "hardhat-ignore-warnings";
import { HardhatUserConfig, extendProvider } from "hardhat/config";
import { task } from "hardhat/config";
import type { NetworkUserConfig } from "hardhat/types";

import CustomProvider from "./CustomProvider";
// Import tasks
import "./tasks/accounts";
import "./tasks/etherscanVerify";
import "./tasks/auction";

extendProvider(async (provider) => {
  const newProvider = new CustomProvider(provider);
  return newProvider;
});

dotenv.config();

// Ensure that we have all the environment variables we need.
const mnemonic: string = process.env.MNEMONIC!;

const chainIds = {
  zama: 8009,
  local: 9000,
  sepolia: 11155111,
};

function getChainConfig(chain: keyof typeof chainIds): NetworkUserConfig {
  let jsonRpcUrl: string;
  switch (chain) {
    case "local":
      jsonRpcUrl = "http://localhost:8545";
      break;
    case "zama":
      jsonRpcUrl = "https://devnet.zama.ai";
      break;
    case "sepolia":
      jsonRpcUrl = process.env.SEPOLIA_RPC_URL!;
  }
  return {
    accounts: {
      count: 10,
      mnemonic,
      path: "m/44'/60'/0'/0",
    },
    chainId: chainIds[chain],
    url: jsonRpcUrl,
  };
}

task("coverage").setAction(async (taskArgs, hre, runSuper) => {
  hre.config.networks.hardhat.allowUnlimitedContractSize = true;
  hre.config.networks.hardhat.blockGasLimit = 1099511627775;

  await runSuper(taskArgs);
});

task("test", async (_taskArgs, hre, runSuper) => {
  // Run modified test task
  if (hre.network.name === "hardhat") {
    await setCodeMocked(hre);
  }
  await runSuper();
});

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  namedAccounts: {
    deployer: 0,
  },
  mocha: {
    timeout: 500000,
  },
  gasReporter: {
    currency: "USD",
    enabled: process.env.REPORT_GAS ? true : false,
    excludeContracts: [],
    src: "./contracts",
  },
  networks: {
    hardhat: {
      accounts: {
        count: 10,
        mnemonic,
        path: "m/44'/60'/0'/0",
      },
      allowUnlimitedContractSize: true,
      blockGasLimit: 1099511627775,
    },
    sepolia: getChainConfig("sepolia"),
    zama: getChainConfig("zama"),
    local: getChainConfig("local"),
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
  },
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      evmVersion: "paris",
    },
  },
  typechain: {
    outDir: "types",
    target: "ethers-v6",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY!,
  },
  warnings: {
    "@openzeppelin/contracts/utils/ReentrancyGuardTransient.sol": {
      default: "off",
    },
  },
};

export default config;
