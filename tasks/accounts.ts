import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

task("accounts", "Prints the list of accounts and their balances", async (args, hre: HardhatRuntimeEnvironment) => {
  const accounts = await hre.getNamedAccounts();
  const provider = hre.ethers.provider;

  for (const [name, address] of Object.entries(accounts)) {
    const balance = await provider.getBalance(address);
    console.log(
      `${name}: ${address} (${hre.ethers.formatEther(balance)} ETH)`
    );
  }
});
