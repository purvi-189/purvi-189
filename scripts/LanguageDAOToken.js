const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const langDAOToken = await ethers.getContractFactory("LanguageDAOToken");
  let LangDAOToken = langDAOToken.deploy("MyLangToken", "MLT", "1000000000000000000000");
  LangDAOToken = await (await LangDAOToken).deployed();
  console.log(`LangDAOToken deployed to ${LangDAOToken.address}`);
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
