import { ethers } from "hardhat";
import "dotenv/config";
import dedent from "dedent";

async function main() {
  const TestLensApiConsumerContract = await ethers.getContractFactory("TestLensApiConsumerContract");

  const [deployer] = await ethers.getSigners();

  console.log('Deploying...');
  const attestor = "0xe11431e055d50b3e974c992adfea9e13ddec2a85"  // When deploy for real e2e test, change it to the real attestor wallet.
  const consumer = await TestLensApiConsumerContract.deploy(attestor);
  await consumer.deployed();
  const finalMessage = `
    🎉 Your Consumer Contract has been deployed, check it out here: https://polygonscan.com/address/${consumer.address}
    
    You also need to set up the consumer contract address in your .env file:
    
    POLYGON_CONSUMER_CONTRACT_ADDRESS=${consumer.address}
  `
  console.log(`\n${finalMessage}\n`);

  console.log('Sending a request...');
  await consumer.connect(deployer).request("0x01c567");
  console.log('Done');
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {

  console.error(error);
  process.exitCode = 1;
});
