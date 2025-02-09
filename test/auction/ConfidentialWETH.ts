import { expect } from "chai";
import { ethers } from "hardhat";
import { createInstance } from "../instance";
import { reencryptEuint64 } from "../reencrypt";
import { getSigners, initSigners } from "../signers";
import { deployAuctionFixture } from "./Auction.fixture";

describe("ConfidentialWETH", function () {
  before(async function () {
    await initSigners();
    this.signers = await getSigners();
  });

  beforeEach(async function () {
    const { weth } = await deployAuctionFixture();
    this.weth = weth;
    this.fhevm = await createInstance();
  });

  it("should wrap ETH", async function () {
    const wrapAmount = ethers.parseEther("1");
    const tx = await this.weth.wrap({ value: wrapAmount });
    await tx.wait();

    // Get encrypted balance
    const balanceHandle = await this.weth.balanceOf(this.signers.alice.address);
    const balance = await reencryptEuint64(
      this.signers.alice,
      this.fhevm,
      balanceHandle,
      await this.weth.getAddress()
    );

    // Convert to same unit as input for comparison
    const balanceInWei = ethers.parseEther(balance.toString());
    expect(balanceInWei).to.equal(wrapAmount);
  });

  it("should unwrap WETH", async function () {
    // First wrap some ETH
    const wrapAmount = ethers.parseEther("1");
    await this.weth.wrap({ value: wrapAmount });

    // Get initial ETH balance
    const initialBalance = await ethers.provider.getBalance(this.signers.alice.address);

    // Unwrap the WETH
    const tx = await this.weth.unwrap(ethers.parseEther("0.5").toString());
    const receipt = await tx.wait();
    
    // Account for gas costs
    const gasUsed = receipt ? receipt.gasUsed * receipt.gasPrice : 0n;
    
    // Get final balance
    const finalBalance = await ethers.provider.getBalance(this.signers.alice.address);
    
    // The difference should be 0.5 ETH minus gas costs
    const expectedDiff = ethers.parseEther("0.5") - gasUsed;
    expect(finalBalance - initialBalance).to.equal(expectedDiff);
  });

  it("should prevent unwrapping more than balance", async function () {
    // Wrap 1 ETH
    await this.weth.wrap({ value: ethers.parseEther("1") });

    // Try to unwrap 2 ETH
    const tx = this.weth.unwrap(ethers.parseEther("2").toString());
    await expect(tx).to.be.revertedWith("Insufficient balance");
  });
});
