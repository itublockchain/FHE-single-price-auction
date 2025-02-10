# 🏰 Confidential Single-Price Auction: Revolutionizing Token Sales with Privacy

<div align="center">
  <img src="https://img.shields.io/badge/Technology-fhEVM-blueviolet?style=for-the-badge&logo=ethereum" alt="fhEVM Technology"/>
  <img src="https://img.shields.io/badge/Privacy-Encrypted-green?style=for-the-badge&logo=privacy" alt="Privacy Focused"/>
  <img src="https://img.shields.io/badge/Zama-Bounty%20Submission-blue?style=for-the-badge" alt="Zama Bounty"/>
</div>

## 🌟 Project Overview

The Confidential Single-Price Auction is a pioneering auction system leveraging Zama's Fully Homomorphic Encryption Virtual Machine (fhEVM) to enable private and secure token sales. This ensures that bids (e.g., amount, price) remain encrypted while maintaining fairness and transparency in auction resolution.

It is a Hardhat-based project that allows users to deploy a fully confidential auction system on Ethereum testnets such as Sepolia. The system ensures complete bid confidentiality while enabling seamless interaction with smart contracts.

## 🚀 About

### Auction Mechanics
If an auction does not sell fully, resolution mechanisms include:
- Refunding bidders for unfulfilled allocations
- Executing at the lowest bid price to distribute remaining tokens

### Key Design Principles
- Enforced one-bid-per-user policy via mapping and bid validation
- Prohibited bid modifications
- Configurable auction duration
- First submitted bid at the lowest price is prioritized
- Locking mechanism ensures funds are deposited before bid submission

## 🚧 Limitations
- Current test suite is not fully operational
- Significant challenges in running comprehensive tests on live networks
- Performance bottlenecks in homomorphic encryption computations
- Potential instability in complex auction scenarios
- Limited support for edge cases and exceptional conditions
- Ongoing optimization required for computational efficiency
- Potential security vulnerabilities yet to be fully addressed

## 🚀 Future Roadmap
1. Optimize smart contracts to improve gas efficiency
2. Refine auction logic to handle edge cases
3. Integrate multi-token support (ERC721, ERC1155)
4. Enable cross-chain functionality with Layer-2 solutions and bridges
5. Strengthen privacy with advanced cryptographic protocols:
   - zk-SNARKs
   - Zero-Knowledge Rollups
   - Improved Homomorphic Encryption
   - Secure multiparty computation (SMPC)

## Design
Check out our detailed design mockup on Figma:
[ Zama FHE Auction Design](https://www.figma.com/design/UBdZ2moGApVw7dFFZcZ8Vr/ZAMA-FHE?node-id=0-1&t=ONVyuRpVe67EORc4-1)

## 🚀 Quick Start

### Setup
```bash
# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env
```

### Available Commands
```bash
# List accounts and balances
pnpm hardhat accounts

# Check specific account balance
pnpm hardhat check-balance --account <ADDRESS>

# Get factory information
pnpm hardhat factory-info

# Run tests
pnpm test

# Deploy to network
pnpm hardhat deploy --network sepolia

# Verify contract on Etherscan
pnpm hardhat verify-deployed
```

### Networks
- Hardhat (local)
- Sepolia Testnet
- Zama Network

## How to Use the Confidential Auction

### Setup an Auction
```bash
npx hardhat --network fhevm auction setup --mint 1000 --unpause
# --mint option to distribute tokens to all participants
# --unpause option to activate the auction
# --help to list all available commands
```

### Inspect Deployed Auction
```bash
npx hardhat --network fhevm auction show
```

### Bidding
```bash
# Use auction address
npx hardhat --network fhevm auction bid \
  --auction 0x3Aa5ebB10DC797CAC828524e59A333d0A371443c \
  --user alice \
  --amount 10n

# Resolve auction address automatically
npx hardhat --network fhevm auction bid \
  --user alice \
  --amount 10n
```

## 💌 Contact & Support
- **Twitter**: [@ITUblockchain]

## Disclaimer
This is a research prototype. Extensive security review recommended for production use.

---

<div align="center">
  <img src="https://img.shields.io/badge/Built%20with-%E2%9D%A4%EF%B8%8F-red?style=for-the-badge" alt="Built with Love"/>
</div>
