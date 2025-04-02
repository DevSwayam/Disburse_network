const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("RemoteRecipient & MultiSender (Local Mock Test)", function () {
  async function deployBothFixture() {
    // 1. Deploy the RemoteRecipient
    const RemoteRecipient = await ethers.getContractFactory("RemoteRecipient");
    const remoteRecipient = await RemoteRecipient.deploy();
    await remoteRecipient.deployed();

    // 2. Deploy the MultiSender
    const MultiSender = await ethers.getContractFactory("MultiSender");
    // For local testing, we can just mock the mailbox & solver addresses
    const mailboxMock = ethers.Wallet.createRandom().address;
    const solverMock = ethers.Wallet.createRandom().address;
    const multiSender = await MultiSender.deploy(mailboxMock, solverMock);
    await multiSender.deployed();

    // Return references to use in our tests
    return { remoteRecipient, multiSender, mailboxMock, solverMock };
  }

  it("Should initialize and fund both contracts", async function () {
    // Load our fixture (deploys both contracts once, then reverts to snapshot for each test)
    const { remoteRecipient, multiSender } = await loadFixture(deployBothFixture);

    // Initialize the MultiSender with remoteRecipient
    await multiSender.initialize(remoteRecipient.address);

    // For demonstration: fund both contracts with some ETH
    const [owner] = await ethers.getSigners();

    // Send 0.5 ETH to the RemoteRecipient
    await owner.sendTransaction({
      to: remoteRecipient.address,
      value: ethers.utils.parseEther("0.5"),
    });

    // Send 0.5 ETH to the MultiSender
    await owner.sendTransaction({
      to: multiSender.address,
      value: ethers.utils.parseEther("0.5"),
    });

    // Check final balances (local chain only)
    expect(await ethers.provider.getBalance(remoteRecipient.target)).to.equal(
      ethers.utils.parseEther("0.5")
    );
    expect(await ethers.provider.getBalance(multiSender.target)).to.equal(
      ethers.utils.parseEther("0.5")
    );
  });
});
