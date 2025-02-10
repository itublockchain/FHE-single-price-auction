import { isAddress } from "ethers";
import { FhevmInstance, createInstance, initFhevm } from "fhevmjs/bundle";

const ACL_ADDRESS: string = "0xFee8407e2f5e3Ee68ad77cAE98c434e637f516e5";

export type Keypair = {
  publicKey: string;
  privateKey: string;
  signature: string;
};

type Keypairs = {
  [key: string]: {
    [key: string]: Keypair;
  };
};

export const init = async () => {
  await initFhevm({ thread: navigator.hardwareConcurrency });
};

let instancePromise: Promise<FhevmInstance>;
let instance: FhevmInstance;

const keypairs: Keypairs = {};

export const createFhevmInstance = async () => {
  console.log("Instance Promise", instancePromise);
  // if (instancePromise) return instancePromise;

  instancePromise = createInstance({
    network: window.ethereum,
    aclContractAddress: ACL_ADDRESS,
    kmsContractAddress: "0x904Af2B61068f686838bD6257E385C2cE7a09195",
    gatewayUrl: "https://gateway.sepolia.zama.ai/",
  });
  console.log("Instance Promise 2", instancePromise);
  instance = await instancePromise;
  console.log("From fhevmjs 1", instance);
};

export const setKeypair = (contractAddress: string, userAddress: string, keypair: Keypair) => {
  if (!isAddress(contractAddress) || !isAddress(userAddress)) return;
  keypairs[userAddress][contractAddress] = keypair;
};

export const getKeypair = (contractAddress: string, userAddress: string): Keypair | null => {
  if (!isAddress(contractAddress) || !isAddress(userAddress)) return null;
  return keypairs[userAddress] ? keypairs[userAddress][contractAddress] || null : null;
};

export const getInstance = (): FhevmInstance => {
  console.log("From fhevmjs", instance);
  return instance;
};
