import { expect } from "chai";
import { ethers } from "hardhat";
import { createInstance } from "../instance";
import { reencryptEuint64 } from "../reencrypt";
import { getSigners, initSigners } from "../signers";
import { createAuctionFixture, deployAuctionFixture } from "./Auction.fixture";

describe("Auction System", function () {
  before(async function () {
    await initSigners();
    this.signers = await getSigners();
  });

  describe("AuctionFactory", function () {
    beforeEach(async function () {
      const { auctionFactory, weth } = await deployAuctionFixture();
      this.factory = auctionFactory;
      this.weth = weth;
      this.fhevm = await createInstance();
    });

    it("should deploy with ConfidentialWETH", async function () {
      const wethAddress = await this.factory.paymentToken();
      expect(wethAddress).to.not.equal(ethers.ZeroAddress);
      
      const weth = await ethers.getContractAt("ConfidentialWETH", wethAddress);
      expect(await weth.name()).to.equal("Confidential Wrapped Ether");
      expect(await weth.symbol()).to.equal("WETHc");
    });

    it("should create new auction", async function () {
      const tx = await this.factory.createAuction(
        "Test Auction",
        "Test Description",
        86400,
        1000
      );
      const receipt = await tx.wait();

      // Verify event was emitted
      const event = receipt?.logs.find(log => 
        log.topics[0] === this.factory.interface.getEventTopic('AuctionCreated')
      );
      expect(event).to.not.be.undefined;

      const decodedEvent = this.factory.interface.decodeEventLog(
        'AuctionCreated',
        event!.data,
        event!.topics
      );

      expect(decodedEvent.title).to.equal("Test Auction");
      expect(decodedEvent.desc).to.equal("Test Description");
      expect(decodedEvent.seller).to.equal(this.signers.alice.address);
    });
  });

  describe("Auction", function () {
    beforeEach(async function () {
      const { auction, weth, token } = await createAuctionFixture();
      this.auction = auction;
      this.weth = weth;
      this.token = token;
      this.fhevm = await createInstance();

      // Wrap some ETH for testing
      await this.weth.wrap({ value: ethers.parseEther("10") });
    });

    it("should allow placing bids", async function () {
      // Create encrypted bid amount
      const input = this.fhevm.createEncryptedInput(
        await this.auction.getAddress(),
        this.signers.alice.address
      );
      input.add64(ethers.parseEther("1").toString());
      const encryptedBid = await input.encrypt();

      // Place bid
      const tx = await this.auction.placeBid(
        encryptedBid.handles[0],
        encryptedBid.inputProof
      );
      await tx.wait();

      // Verify bid was placed (would need to implement view functions in contract)
      const bidHandle = await this.auction.getBid(this.signers.alice.address);
      const bidAmount = await reencryptEuint64(
        this.signers.alice,
        this.fhevm,
        bidHandle,
        await this.auction.getAddress()
      );
      expect(bidAmount).to.equal(ethers.parseEther("1"));
    });

    it("should end auction after deadline", async function () {
      // Place a bid first
      const input = this.fhevm.createEncryptedInput(
        await this.auction.getAddress(),
        this.signers.alice.address
      );
      input.add64(ethers.parseEther("1").toString());
      const encryptedBid = await input.encrypt();
      await this.auction.placeBid(
        encryptedBid.handles[0],
        encryptedBid.inputProof
      );

      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [86401]); // 1 day + 1 second
      await ethers.provider.send("evm_mine", []);

      // End auction
      const tx = await this.auction.endAuction();
      await tx.wait();

      // Verify auction ended
      expect(await this.auction.isEnded()).to.be.true;
    });
  });
});
