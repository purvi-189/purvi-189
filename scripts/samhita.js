const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const Samhita = await ethers.getContractFactory("Samhita");
  let samhita = Samhita.deploy(
    "0xe61D10Ee93478c126c7A5707E815377221096c95",
    "0x942732C97A710a22Fe9c68f62582Aa99520e1B69",
    "0x7e3D13CB4A1d35e1748ae49aDC5f0387FfB4Acc8",
    "nft uri link"
  );
  samhita = await (await samhita).deployed();
  console.log(`samhita deployed to ${samhita.address}`);
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
