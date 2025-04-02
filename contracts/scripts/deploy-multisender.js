// scripts/deploy-multisender.js
const { ethers } = require("hardhat");
const config = require("../config");


async function main() {
  // Compile if necessary, but Hardhat usually auto-compiles
  // await hre.run('compile');

  // Retrieve the contract factory
  const MultiSender = await ethers.getContractFactory("MultiSender");

  // These are the same constructor arguments that Ignition was using:
  const mailbox = config.disburse.mailbox;
  const solver = config.solverAddress;

  // Deploy your MultiSender contract
  const multiSender = await MultiSender.deploy(mailbox, solver);

  // Wait for the contract to be mined
  await multiSender.waitForDeployment();


  console.log("MultiSender deployed to:", await multiSender.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
