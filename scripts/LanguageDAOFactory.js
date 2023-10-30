const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const langDAOFactory = await ethers.getContractFactory("LanguageDAOFactory");
  let LangDAOFactory = langDAOFactory.deploy();
  LangDAOFactory = await (await LangDAOFactory).deployed();
  console.log(`languageDAOfactory deployed to ${LangDAOFactory.address}`);
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
