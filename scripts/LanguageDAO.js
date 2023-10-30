const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const LanguageDAO = await ethers.getContractFactory("LanguageDAO");
  let langDAO = LanguageDAO.deploy(
    "0xe61D10Ee93478c126c7A5707E815377221096c95",
    "0x7A84b1B330eB4F07aD62eD155772A7DF29986436",
    "0x7e3D13CB4A1d35e1748ae49aDC5f0387FfB4Acc8",
    "nft uri link from langdao"
  );
  langDAO = await (await langDAO).deployed();
  console.log(`languageDAO deployed to ${langDAO.address}`);
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
