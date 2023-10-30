const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const TemplateNFT = await ethers.getContractFactory("TemplateNFT");
  let templateNFT = TemplateNFT.deploy();
  templateNFT = await (await templateNFT).deployed();
  console.log(`TemplateNFT deployed to ${templateNFT.address}`);
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
