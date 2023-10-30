const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const samhitaToken = await ethers.getContractFactory("samhitaToken");
  let SamhitaToken = samhitaToken.deploy("100000000000000000000000");
  SamhitaToken = await (await SamhitaToken).deployed();
  console.log(`SamhitaToken deployed to ${SamhitaToken.address}`);
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
