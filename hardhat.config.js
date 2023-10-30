require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",

  networks: {
    bttc: {
      chainId: 1029,
      url: "https://pre-rpc.bt.io/",
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
