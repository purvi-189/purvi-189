const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const Timelock = await ethers.getContractFactory("Timelock");
  let timelock = Timelock.deploy("600");
  timelock = await (await timelock).deployed();
  console.log(`timelock deployed to ${timelock.address}`);

}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
