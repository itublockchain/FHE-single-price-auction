import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Deploy AuctionFactory
  const auctionFactory = await deploy("AuctionFactory", {
    from: deployer,
    args: [], // Constructor doesn't take any arguments
    log: true,
  });

  console.log(`AuctionFactory contract deployed to: ${auctionFactory.address}`);
  
  // The AuctionFactory constructor will automatically deploy ConfidentialWETH
  console.log(`ConfidentialWETH can be found by calling paymentToken() on the AuctionFactory`);
};

export default func;
func.id = "deploy_auction_factory"; // id required to prevent reexecution
func.tags = ["AuctionFactory"];
