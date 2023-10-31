const { ethers } = require("hardhat");
const { BigNumber, utils } = require("ethers");
const { expect, assert } = require("chai");

const ERC20abi = require("../artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json");
const ERC721abi = require("../artifacts/@openzeppelin/contracts/token/ERC721/ERC721.sol/ERC721.json");
const { providers } = require("ethers");

describe("Language DAO", function () {
  let langDAO,
    timelock,
    token,
    templateNFT,
    contract,
    nftcontract,
    proposer,
    voter1,
    voter2,
    voter3,
    voter4,
    voter5,
    admin;

    const ProposalState = {
    Pending: 0,
    Active: 1,
    Canceled: 2,
    Defeated: 3,
    Succeeded: 4,
    Queued: 5,
    Expired: 6,
    Executed: 7,
  };

  beforeEach(async function () {
    [admin, proposer, voter1, voter2, voter3, voter4, voter5] =
      await ethers.getSigners();

    const MIN_DELAY = 600;

    // time lock contract
    const Timelock = await ethers.getContractFactory("Timelock");
    timelock = await Timelock.connect(admin).deploy(MIN_DELAY);
    await timelock.deployed();

    // token contract
    const Token = await ethers.getContractFactory("LanguageDAOToken");
    token = await Token.connect(admin).deploy("LanguageToken", "MLT", "1000");

    // template nft contract
    const TemplateNFT = await ethers.getContractFactory("TemplateNFT");
    templateNFT = await TemplateNFT.deploy();
    await templateNFT.deployed();

    // language DAO contract
    const LanguageDAO = await ethers.getContractFactory("LanguageDAO");
    langDAO = await LanguageDAO.connect(admin).deploy(
      timelock.address,
      token.address,
      templateNFT.address,
      "ipfs uri link of langDAO"
    );


    await langDAO.deployed();
    await timelock.connect(admin).setLanguageDAOAddress(langDAO.address);
    await templateNFT.connect(admin).setLanguageDAOAddress(langDAO.address);
    nftcontract = new ethers.Contract(
      templateNFT.address,
      ERC721abi.abi,
      admin
    );
  });

  it("should return correct quorumVotes value", async function () {
    console.log(
      "admin ETH balance: ",
      await ethers.provider.getBalance(admin.address)
    );
    const quorum = await langDAO.quorumVotes();
    expect(quorum).to.equal(40);
  });

  it("should return correct proposalMaxOperations value", async function () {
    expect(await langDAO.proposalMaxOperations()).to.equal(10);
  });

  it("should return correct proposalThreshold value", async function () {
    expect(await langDAO.proposalThreshold()).to.equal(10);
  });

  it("transfer langDAO tokens to the contract", async function () {
    console.log("admin Tokens:", await token.balanceOf(admin.address));

    // Capture the transaction receipt by assigning the result to `tx`
    const tx = await token.connect(admin).transfer(langDAO.address, "100"); // 100
    await tx.wait();

    expect(await token.balanceOf(langDAO.address)).to.equal("100");
  });
  // start
  it("should add a member to the langDAO DAO", async function () {
    const propB = await ethers.provider.getBalance(proposer.address);
    console.log("proposer eth balance: ", propB);
    const tokenPrice = await token.getTokenPrice();
    const initialContractBalance = await ethers.provider.getBalance(
      langDAO.address
    );
    console.log(
      "-----> initial contract balance (ETH): ",
      initialContractBalance
    );

    // transfer tokens to the contract  -- 1000
    const tx = await token.connect(admin).transfer(langDAO.address, "1000");
    await tx.wait();

    console.log("contract tokens: ", await token.balanceOf(langDAO.address));

    await langDAO.connect(proposer).addMember(15, { value: 15 * tokenPrice });
    //  expect(
    //   await langDAO.connect(proposer).addMember(1005, { value: 1005 * tokenPrice},
    //   )).to.be.revertedWith( "Contract does not have enough langDAOTokens" );

    const tx_ = await langDAO.connect(proposer).addMember(20, {
      value: 20 * tokenPrice,
    });
    console.log("proposer tokens: ", await token.balanceOf(proposer.address));
    await langDAO.connect(voter1).addMember(10, {
      value: 10 * tokenPrice,
    });
    await langDAO.connect(voter2).addMember(21, {
      value: 21 * tokenPrice,
    });
    await langDAO.connect(voter3).addMember(18, {
      value: 18 * tokenPrice,
    });
    await langDAO.connect(voter4).addMember(15, {
      value: 15 * tokenPrice,
    });

    expect(await token.balanceOf(proposer.address)).to.equal("35");
    expect(await token.balanceOf(voter1.address)).to.equal("10");
    expect(await token.balanceOf(voter4.address)).to.equal("15");

    await token.writeCheckpoint(voter1.address, 0, 0, 10);
    await token.writeCheckpoint(voter2.address, 0, 0, 21);
    await token.writeCheckpoint(voter3.address, 0, 0, 18);
    await token.writeCheckpoint(voter4.address, 0, 0, 15);

    expect(await langDAO.isMemberAdded(proposer.address)).to.equal(true);
    expect(await langDAO.isMemberAdded(voter1.address)).to.equal(true);
    expect(await langDAO.isMemberAdded(voter2.address)).to.equal(true);
    expect(await langDAO.isMemberAdded(voter3.address)).to.equal(true);
    expect(await langDAO.isMemberAdded(voter4.address)).to.equal(true);
    expect(await langDAO.isMemberAdded(voter5.address)).to.equal(false);

    //     //------------------ create a proposal---------------------------------
    const stakeAmount = await langDAO.proposalStake();
    const royalty = await langDAO.royaltyFee();

    const total = parseInt(stakeAmount) + parseInt(royalty);
    const sum = parseInt(total);
    console.log(sum);
    // approve tokens
    await token.connect(proposer).approve(langDAO.address, String(sum));
    //         // delegate votes
    await token.delegate(proposer.address);

    const transx = await langDAO
      .connect(proposer)
      .propose(
        [token.address],
        [0],
        ["execute(uint)"],
        [ethers.utils.defaultAbiCoder.encode(["uint256"], [42])],
        "My Proposal Title",
        "Proposal of langDAO DAO",
        "bafybeifrwhe5h22blc33rgvcktxe3wedjq467caia23ce7toal4tym2doy",
        "1",
        { value: String(sum) }
      );
    const proposalId = (await transx.wait()).events[0].args.id;
    console.log("id: ", proposalId);
    console.log("proposal created...!");

    // Creator NFT
    const creatorNfts = await templateNFT.getCreatorNFTs(admin.address);
    console.log("CreatorNFTS", creatorNfts);
    console.log(await templateNFT.creatorIdTocreatorData(creatorNfts[0]));

    // create proposal with incorrect stake amount
    await expect(
      langDAO.connect(proposer).propose(
        [token.address],
        [0],
        ["execute(uint)"],
        [ethers.utils.defaultAbiCoder.encode(["uint256"], [42])],
        "My Proposal Title",
        "Proposal of langDAO DAO",
        "bafybeifrwhe5h22blc33rgvcktxe3wedjq467caia23ce7toal4tym2doy",
        "1",

        { value: 0 }
      )
    ).to.be.revertedWith(
      "You must have valid stake amount to create a proposal"
    );

    // not a member of langDAO DAO
    // await expect(
    //   langDAO.connect(voter5).propose(
    //     [token.address],
    //     [0],
    //     ["execute(uint)"],
    //     [ethers.utils.defaultAbiCoder.encode(["uint256"], [42])],
    //     "My Proposal Title",
    //     "Proposal of langDAO DAO",
    //     "bafybeifrwhe5h22blc33rgvcktxe3wedjq467caia23ce7toal4tym2doy",
    //     "1",

    //     { value: String(sum) }
    //   )
    // ).to.be.revertedWith("You are not the member of ths langDAO DAO");

    // arity mismatch
    await expect(
      langDAO
        .connect(proposer)
        .propose(
          [token.address],
          [],
          ["execute(uint)"],
          [ethers.utils.defaultAbiCoder.encode(["uint256"], [42])],
          "My Proposal Title",
          "Proposal of langDAO DAO",
          "bafybeifrwhe5h22blc33rgvcktxe3wedjq467caia23ce7toal4tym2doy",
          "1",
          { value: String(sum) }
        )
    ).to.be.revertedWith("proposal function information arity mismatch");

    //some action must be there
    await expect(
      langDAO.connect(proposer).propose(
        [],
        [],
        [],
        [],
        "My Proposal Title",
        "Proposal of langDAO DAO",
        "bafybeifrwhe5h22blc33rgvcktxe3wedjq467caia23ce7toal4tym2doy",
        "1",

        { value: String(sum) }
      )
    ).to.be.revertedWith("some action must be there");

    // too many actions
    await expect(
      langDAO.connect(proposer).propose(
        Array.from({ length: 11 }, (_, i) => token.address), // Array of addresses
        Array(11).fill(0), // Array of values
        Array.from({ length: 11 }, (_, i) => `execute(uint)`), // Array of signatures
        Array(11).fill(
          ethers.utils.defaultAbiCoder.encode(
            ["string"],
            ["Proposal to transfer tokens to an address"]
          )
        ),
        "My Proposal Title",
        "Proposal of langDAO DAO",
        "bafybeifrwhe5h22blc33rgvcktxe3wedjq467caia23ce7toal4tym2doy",
        "1",
        { value: String(sum) }
      )
    ).to.be.revertedWith("too many actions");

    // queue a proposal --------------------------------------------------------------
    const proposal = await langDAO.proposals(1);
    console.log("proposal ID: ", proposalId);
    console.log(
      "state after creating prop- Active: ",
      await langDAO.state(proposalId)
    );
    ///-------------++ QUEUE ++------------------------------------------------
    // waiting for 1 block to pass before voting
    await ethers.provider.send("evm_mine");

    //-------------------  voting start
    const currentTime = (await ethers.provider.getBlock("latest")).timestamp;
    const futureTime = currentTime + 600;
    await ethers.provider.send("evm_setNextBlockTimestamp", [futureTime]);
    await ethers.provider.send("evm_mine");

    try {
      await langDAO.connect(voter1).castVote(proposalId, true);
      await langDAO.connect(voter2).castVote(proposalId, true);
      await langDAO.connect(voter3).castVote(proposalId, true);
      await langDAO.connect(voter4).castVote(proposalId, false);
      const forVotes_ = (await langDAO.proposalsBasicData(proposalId)).forVotes;
      console.log("For Votes: ", forVotes_);

      console.log("voting done");
      // 40 blocks
      for (let i = 0; i < 40; i++) {
        await ethers.provider.send("evm_mine");
      }
      const p = await langDAO.state(proposalId);
      console.log("succeeded: ", p);

      // await langDAO.connect(admin).queue(proposalId,"1")

    // Template NFT
    console.log("template NFT");
    const id = await templateNFT.getAlltemplateIDS(proposer.address);
    console.log(id);

    const templateOfUser = await templateNFT.getAlltemplateIDS(proposer.address);
      console.log("len: ",templateOfUser.length);
// if (templateOfUser.length > 0) {
//   console.log("User has minted template NFTs.");
// } else {
//   console.log("User has not minted any template NFTs.");
// }


    // const tmp = await templateNFT.getTemplateDetails(id[0]);
    // console.log(tmp);

      // ----> creating template
      // await templateNFT.
      // const templateID = 1
      // await langDAO.connect(admin).queue(proposalId, templateID);
      // console.log("prop queued");

      // const state = await langDAO.state(proposalId);
      // console.log("state: ",state);
    } catch (error) {
      console.error("An error occurred during voting:", error);
    }

  //       const finall = await ethers.provider.getBalance(proposer.address);
  //       console.log("proposer eth balance after queued: ", finall);
  //     } catch (error) {
  //       console.error("An error occurred during voting:", error);
  //     }

  //     // Template NFT
  //     console.log("template NFT");
  //     const id = await templateNFT.getAlltemplateIDS(proposer.address);
  //     console.log(id);
  //     const tmp = await templateNFT.getTemplateDetails(id[0]);
  //     console.log(tmp);
    });

  //   it("should not allow to vote after voting is closed", async function () {
  //     const propB = await ethers.provider.getBalance(proposer.address);
  //     console.log("proposer eth balance: ", propB);
  //     const tokenPrice = await token.getTokenPrice();
  //     const initialContractBalance = await ethers.provider.getBalance(
  //       langDAO.address
  //     );
  //     console.log("-----> initial contract balance: ", initialContractBalance);

  //     await expect(
  //       langDAO.connect(proposer).addMember(2000, {
  //         value: ethers.utils.parseEther(String((2000 * tokenPrice) / 10 ** 18)),
  //       })
  //     ).to.be.revertedWith("Contract does not have enough samhitaTokens");

  //     // transfer tokens to the contract  -- 1000
  //     const tx = await token.connect(admin).transfer(langDAO.address, "1000");
  //     await tx.wait();
  //     console.log(
  //       "langDAO contract tokens: ",
  //       await token.balanceOf(langDAO.address)
  //     );

  //     await expect(
  //       langDAO.connect(proposer).addMember(6, {
  //         value: 6 * tokenPrice,
  //       })
  //     ).to.be.revertedWith(
  //       "You must purchase at least 10 tokens to become a member"
  //     );

  //     const tx_ = await langDAO.connect(proposer).addMember(20, {
  //       value: 20 * tokenPrice,
  //     });
  //     console.log("proposer tokens: ", await token.balanceOf(proposer.address));

  //     await langDAO.connect(voter1).addMember(10, {
  //       value: 10 * tokenPrice,
  //     });
  //     await langDAO.connect(voter2).addMember(21, {
  //       value: 21 * tokenPrice,
  //     });

  //     expect(await token.balanceOf(proposer.address)).to.equal("20");
  //     expect(await token.balanceOf(voter1.address)).to.equal("10");
  //     expect(await token.balanceOf(voter2.address)).to.equal("21");

  //     await token.writeCheckpoint(voter1.address, 0, 0, 10);
  //     await token.writeCheckpoint(voter2.address, 0, 0, 21);

  //     //------------------ create a proposal---------------------------------
  //     const stakeAmount = await langDAO.proposalStake();
  //     // approve tokens
  //     await token.connect(proposer).approve(langDAO.address, stakeAmount);

  //     // delegate votes
  //     await token.delegate(proposer.address);

  //     const propBalance = await ethers.provider.getBalance(proposer.address);

  //     const transx = await langDAO
  //       .connect(proposer)
  //       .propose(
  //         [token.address],
  //         [0],
  //         ["execute(uint)"],
  //         [ethers.utils.defaultAbiCoder.encode(["uint256"], [42])],
  //         "My Proposal Title",
  //         "Proposal of langDAO DAO",
  //         "bafybeifrwhe5h22blc33rgvcktxe3wedjq467caia23ce7toal4tym2doy",
  //         "template",
  //         { value: stakeAmount }
  //       );

  //     await transx.wait();
  //     // console.log("3456: ",proposalId);
  //     console.log("proposal created...!");
  //     const proposalId = (await langDAO.proposals(1)).id.toNumber();

  //     // waiting for 1 block to pass before voting
  //     await ethers.provider.send("evm_mine");

  //     //-------------------  voting start
  //     const currentTime = (await ethers.provider.getBlock("latest")).timestamp;
  //     const futureTime = currentTime + 600;
  //     await ethers.provider.send("evm_setNextBlockTimestamp", [futureTime]);
  //     await ethers.provider.send("evm_mine");

  //     await langDAO.connect(voter1).castVote(proposalId, true);

  //     const forVotes_ = (await langDAO.proposalsBasicData(proposalId)).forVotes;
  //     console.log("For Votes: ", forVotes_);
  //     // 40 blocks
  //     for (let i = 0; i < 40; i++) {
  //       await ethers.provider.send("evm_mine");
  //     }
  //     console.log("voting closed");

  //     await expect(
  //       langDAO.connect(voter2).castVote(proposalId, true)
  //     ).to.be.revertedWith("voting is closed");
  //   });

  //   it("should revert if the voter has already voted", async function () {
  //     const tokenPrice = await token.getTokenPrice();
  //     // transfer tokens to the contract  -- 1000
  //     const tx = await token.connect(admin).transfer(langDAO.address, "1000");
  //     await tx.wait();

  //     const tx_ = await langDAO.connect(proposer).addMember(20, {
  //       value: 20 * tokenPrice,
  //     });

  //     await langDAO.connect(voter1).addMember(10, {
  //       value: 10 * tokenPrice,
  //     });
  //     await langDAO.connect(voter2).addMember(21, {
  //       value: 21 * tokenPrice,
  //     });
  //     await langDAO.connect(voter3).addMember(18, {
  //       value: 18 * tokenPrice,
  //     });

  //     expect(await token.balanceOf(proposer.address)).to.equal("20");

  //     await token.writeCheckpoint(voter1.address, 0, 0, 10);
  //     await token.writeCheckpoint(voter2.address, 0, 0, 21);
  //     await token.writeCheckpoint(voter3.address, 0, 0, 18);

  //     //    //------------------ create a proposal---------------------------------
  //     const stakeAmount = await langDAO.proposalStake();
  //     // approve tokens
  //     await token.connect(proposer).approve(langDAO.address, stakeAmount);
  //     // delegate votes
  //     await token.delegate(proposer.address);

  //     await langDAO
  //       .connect(proposer)
  //       .propose(
  //         [token.address],
  //         [0],
  //         ["execute(uint)"],
  //         [ethers.utils.defaultAbiCoder.encode(["uint256"], [42])],
  //         "My Proposal Title",
  //         "Proposal of langDAO DAO",
  //         "bafybeifrwhe5h22blc33rgvcktxe3wedjq467caia23ce7toal4tym2doy",
  //         "template",
  //         { value: stakeAmount }
  //       );
  //     const proposalId = (await langDAO.proposals(1)).id.toNumber();

  //     //---------------queue------------------------------------------------
  //     // waiting for 1 block to pass before voting
  //     await ethers.provider.send("evm_mine");

  //     //-------------------  voting start
  //     const currentTime = (await ethers.provider.getBlock("latest")).timestamp;
  //     const futureTime = currentTime + 600;
  //     await ethers.provider.send("evm_setNextBlockTimestamp", [futureTime]);
  //     await ethers.provider.send("evm_mine");

  //     try {
  //       await langDAO.connect(voter1).castVote(proposalId, true);
  //       await langDAO.connect(voter2).castVote(proposalId, true);
  //       await expect(
  //         langDAO.connect(voter1).castVote(proposalId, true)
  //       ).to.be.revertedWith("voter has already voted");

  //       // 40 blocks
  //       for (let i = 0; i < 40; i++) {
  //         await ethers.provider.send("evm_mine");
  //       }
  //     } catch (error) {
  //       console.error("An error occurred during voting:", error);
  //       ;
  //     }
  //   });

  //   it("should not exexcute if it is in non queued state", async function () {
  //     const propB = await ethers.provider.getBalance(proposer.address);
  //     console.log("proposer eth balance: ", propB);
  //     const tokenPrice = await token.getTokenPrice();
  //     const initialContractBalance = await ethers.provider.getBalance(
  //       langDAO.address
  //     );
  //     console.log("-----> initial contract balance: ", initialContractBalance);

  //     await expect(
  //       langDAO.connect(proposer).addMember(2000, {
  //         value: ethers.utils.parseEther(String((2000 * tokenPrice) / 10 ** 18)),
  //       })
  //     ).to.be.revertedWith("Contract does not have enough samhitaTokens");

  //     // transfer tokens to the contract  -- 1000
  //     const tx = await token.connect(admin).transfer(langDAO.address, "1000");
  //     await tx.wait();
  //     console.log(
  //       "langDAO contract tokens: ",
  //       await token.balanceOf(langDAO.address)
  //     );
  //     const tx_ = await langDAO.connect(proposer).addMember(20, {
  //       value: 20 * tokenPrice,
  //     });

  //     await langDAO.connect(voter1).addMember(10, {
  //       value: 10 * tokenPrice,
  //     });
  //     await langDAO.connect(voter2).addMember(21, {
  //       value: 21 * tokenPrice,
  //     });
  //     await langDAO.connect(voter3).addMember(18, {
  //       value: 18 * tokenPrice,
  //     });

  //     await token.writeCheckpoint(voter1.address, 0, 0, 10);
  //     await token.writeCheckpoint(voter2.address, 0, 0, 21);
  //     await token.writeCheckpoint(voter3.address, 0, 0, 18);

  //     //------------------ create a proposal---------------------------------
  //     const stakeAmount = await langDAO.proposalStake();
  //     // approve tokens
  //     await token.connect(proposer).approve(langDAO.address, stakeAmount);

  //     // delegate votes
  //     await token.delegate(proposer.address);

  //     console.log(
  //       "langDAO contract balance after propose:",
  //       await ethers.provider.getBalance(langDAO.address)
  //     );

  //     const propBalance = await ethers.provider.getBalance(proposer.address);
  //     console.log("proposer eth balance: ", propBalance);
  //     const transx = await langDAO
  //       .connect(proposer)
  //       .propose(
  //         [token.address],
  //         [0],
  //         ["execute(uint)"],
  //         [ethers.utils.defaultAbiCoder.encode(["uint256"], [42])],
  //         "My Proposal Title",
  //         "Proposal of langDAO DAO",
  //         "bafybeifrwhe5h22blc33rgvcktxe3wedjq467caia23ce7toal4tym2doy",
  //         "template",
  //         { value: stakeAmount }
  //       );

  //     const proposalId = (await langDAO.proposals(1)).id.toNumber();

  //     await transx.wait();
  //     ///-------------++ QUEUE ++------------------------------------------------
  //     // waiting for 1 block to pass before voting
  //     await ethers.provider.send("evm_mine");

  //     //-------------------  voting start
  //     const currentTime = (await ethers.provider.getBlock("latest")).timestamp;
  //     const futureTime = currentTime + 600;
  //     await ethers.provider.send("evm_setNextBlockTimestamp", [futureTime]);
  //     await ethers.provider.send("evm_mine");

  //     try {
  //       await langDAO.connect(voter1).castVote(proposalId, true);
  //       await langDAO.connect(voter2).castVote(proposalId, true);
  //       await langDAO.connect(voter3).castVote(proposalId, true);
  //       await langDAO.connect(voter4).castVote(proposalId, false);
  //       const forVotes_ = (await langDAO.proposalsBasicData(proposalId)).forVotes;

  //       // 40 blocks
  //       for (let i = 0; i < 40; i++) {
  //         await ethers.provider.send("evm_mine");
  //       }

  //       const state = await langDAO.state(proposalId);
  //       console.log("state as voting not achieved: ", state);
  //       await expect(
  //         langDAO.connect(admin).execute(proposalId)
  //       ).to.be.revertedWith("proposal can only be executed if it is queued");
  //     } catch (error) {
  //       console.error("An error occurred during voting:", error);
  //     }
  //   });

  //   it("can't be canceled if gained enough votes", async function () {
  //     const tokenPrice = await token.getTokenPrice();
  //     // transfer tokens to the contract  -- 1000
  //     const tx = await token.connect(admin).transfer(langDAO.address, "1000");
  //     await tx.wait();

  //     const tx_ = await langDAO.connect(proposer).addMember(20, {
  //       value: 20 * tokenPrice,
  //     });

  //     await langDAO.connect(voter1).addMember(10, {
  //       value: 10 * tokenPrice,
  //     });
  //     await langDAO.connect(voter2).addMember(21, {
  //       value: 21 * tokenPrice,
  //     });
  //     await langDAO.connect(voter3).addMember(18, {
  //       value: 18 * tokenPrice,
  //     });
  //     await langDAO.connect(voter4).addMember(15, {
  //       value: 15 * tokenPrice,
  //     });

  //     expect(await token.balanceOf(proposer.address)).to.equal("20");

  //     await token.writeCheckpoint(voter1.address, 0, 0, 10);
  //     await token.writeCheckpoint(voter2.address, 0, 0, 21);
  //     await token.writeCheckpoint(voter3.address, 0, 0, 18);
  //     await token.writeCheckpoint(voter4.address, 0, 0, 15);

  //        //------------------ create a proposal---------------------------------
  //     const stakeAmount = await langDAO.proposalStake();
  //     // approve tokens
  //     await token.connect(proposer).approve(langDAO.address, stakeAmount);
  //     await token.connect(voter1).approve(langDAO.addMember, stakeAmount);
  //     // delegate votes
  //     await token.delegate(proposer.address);
  //     await token.delegate(voter1.address);

  //     await langDAO
  //       .connect(proposer)
  //       .propose(
  //         [token.address],
  //         [0],
  //         ["execute(uint)"],
  //         [ethers.utils.defaultAbiCoder.encode(["uint256"], [42])],
  //         "My Proposal Title",
  //         "Proposal of langDAO DAO",
  //         "bafybeifrwhe5h22blc33rgvcktxe3wedjq467caia23ce7toal4tym2doy",
  //         "template",
  //         { value: stakeAmount }
  //       );

  //     // queue a proposal ------------------------------------------------------------------------------------

  //     const proposal = await langDAO.proposals(1);
  //     const proposalId = (await langDAO.proposals(1)).id.toNumber();
  //     console.log("proposal ID: ", proposalId);
  //     console.log(
  //       "state after creating prop- Active: ",
  //       await langDAO.state(proposal.id)
  //     );

  //     ///-------------++ QUEUE ++------------------------------------------------
  //     // waiting for 1 block to pass before voting
  //     await ethers.provider.send("evm_mine");

  //     //-------------------  voting start
  //     const currentTime = (await ethers.provider.getBlock("latest")).timestamp;
  //     const futureTime = currentTime + 600;
  //     await ethers.provider.send("evm_setNextBlockTimestamp", [futureTime]);
  //     await ethers.provider.send("evm_mine");

  //     await langDAO.connect(voter1).castVote(proposalId, true);
  //     await langDAO.connect(voter2).castVote(proposalId, true);
  //     await langDAO.connect(voter3).castVote(proposalId, true);
  //     await langDAO.connect(voter4).castVote(proposalId, false);
  //     const forVotes_ = (await langDAO.proposalsBasicData(proposalId)).forVotes;
  //     console.log("For Votes: ", forVotes_);
  //     // 40 blocks
  //     for (let i = 0; i < 40; i++) {
  //       await ethers.provider.send("evm_mine");
  //     }

  //     const p = await langDAO.state(proposalId);

  //     const eta = proposal.eta.toNumber();

  //     // Increase the current time to surpass the eta
  //     // await ethers.provider.send("evm_setNextBlockTimestamp", [eta + 1]); // Adding 1 second to ensure it's in the future
  //     await ethers.provider.send("evm_mine");

  //     await expect(
  //       langDAO.connect(proposer).cancel(proposalId)
  //     ).to.be.revertedWith("proposer above threshold");

  //     const ps1 = await langDAO.state(proposalId);
  //     console.log(
  //       "As votes above threshold cant be canceled..so state is: " + ps1
  //     );

  //   });

  //   it("can be cancel if not executed", async function(){
  //     const propB = await ethers.provider.getBalance(proposer.address);
  //     console.log("proposer eth balance: ", propB);
  //     const tokenPrice = await token.getTokenPrice();
  //     const initialContractBalance = await ethers.provider.getBalance(
  //       langDAO.address
  //     );
  //     console.log("-----> initial contract balance: ", initialContractBalance);

  //     await expect(
  //       langDAO.connect(proposer).addMember(2000, {
  //         value: ethers.utils.parseEther(String((2000 * tokenPrice) / 10 ** 18)),
  //       })
  //     ).to.be.revertedWith("Contract does not have enough samhitaTokens");

  //     // transfer tokens to the contract  -- 1000
  //     const tx = await token.connect(admin).transfer(langDAO.address, "1000");
  //     await tx.wait();
  //     console.log(
  //       "langDAO contract tokens: ",
  //       await token.balanceOf(langDAO.address)
  //     );

  //     await expect(
  //       langDAO.connect(proposer).addMember(6, {
  //         value: 6 * tokenPrice,
  //       })
  //     ).to.be.revertedWith(
  //       "You must purchase at least 10 tokens to become a member"
  //     );

  //     const tx_ = await langDAO.connect(proposer).addMember(20, {
  //       value: 20 * tokenPrice,
  //     });
  //     console.log("proposer tokens: ", await token.balanceOf(proposer.address));

  //     await langDAO.connect(voter1).addMember(10, {
  //       value: 10 * tokenPrice,
  //     });
  //     await langDAO.connect(voter2).addMember(21, {
  //       value: 21 * tokenPrice,
  //     });
  //     await langDAO.connect(voter3).addMember(18, {
  //       value: 18 * tokenPrice,
  //     });
  //     await langDAO.connect(voter4).addMember(15, {
  //       value: 15 * tokenPrice,
  //     });

  //     expect(await token.balanceOf(proposer.address)).to.equal("20");
  //     expect(await token.balanceOf(voter1.address)).to.equal("10");
  //     expect(await token.balanceOf(voter4.address)).to.equal("15");

  //     await token.writeCheckpoint(voter1.address, 0, 0, 10);
  //     await token.writeCheckpoint(voter2.address, 0, 0, 21);
  //     await token.writeCheckpoint(voter3.address, 0, 0, 18);
  //     await token.writeCheckpoint(voter4.address, 0, 0, 15);

  //     expect(await langDAO.isMemberAdded(proposer.address)).to.equal(true);
  //     expect(await langDAO.isMemberAdded(voter1.address)).to.equal(true);
  //     expect(await langDAO.isMemberAdded(voter2.address)).to.equal(true);
  //     expect(await langDAO.isMemberAdded(voter3.address)).to.equal(true);
  //     expect(await langDAO.isMemberAdded(voter4.address)).to.equal(true);
  //     expect(await langDAO.isMemberAdded(voter5.address)).to.equal(false);

  //     //------------------ create a proposal---------------------------------
  //     const stakeAmount = await langDAO.proposalStake();
  //     // approve tokens
  //     await token.connect(proposer).approve(langDAO.address, stakeAmount);

  //     console.log(
  //       "langDAO contract balance after propose:",
  //       await ethers.provider.getBalance(langDAO.address)
  //     );

  //     // delegate votes
  //     await token.delegate(proposer.address);

  //     const propBalance = await ethers.provider.getBalance(proposer.address);
  //     console.log("proposer eth balance: ", propBalance);
  //     const transx = await langDAO
  //       .connect(proposer)
  //       .propose(
  //         [token.address],
  //         [0],
  //         ["execute(uint)"],
  //         [ethers.utils.defaultAbiCoder.encode(["uint256"], [42])],
  //         "My Proposal Title",
  //         "Proposal of langDAO DAO",
  //         "bafybeifrwhe5h22blc33rgvcktxe3wedjq467caia23ce7toal4tym2doy",
  //         "template",
  //         { value: stakeAmount }
  //       );

  //     await transx.wait();
  //     console.log("proposal created...!");
  //     const propBalanceAfter = await ethers.provider.getBalance(proposer.address);
  //     console.log(
  //       "proposer eth balance after (stake deducted): ",
  //       propBalanceAfter
  //     );

  // // queue a proposal ------------------------------------------------------------------------------------

  //     const proposal = await langDAO.proposals(1);
  //     const proposalId = (await langDAO.proposals(1)).id.toNumber();
  //     console.log("proposal ID: ", proposalId);
  //     console.log(
  //       "state after creating prop- Active: ",
  //       await langDAO.state(proposal.id)
  //     );

  //     ///-------------++ QUEUE ++------------------------------------------------
  //     // waiting for 1 block to pass before voting
  //     await ethers.provider.send("evm_mine");

  //     //-------------------  voting start
  //     const currentTime = (await ethers.provider.getBlock("latest")).timestamp;
  //     const futureTime = currentTime + 600;
  //     await ethers.provider.send("evm_setNextBlockTimestamp", [futureTime]);
  //     await ethers.provider.send("evm_mine");

  //     try {
  //       await langDAO.connect(voter1).castVote(proposalId, true);
  //       await langDAO.connect(voter2).castVote(proposalId, true);
  //       await langDAO.connect(voter3).castVote(proposalId, true);
  //       await langDAO.connect(voter4).castVote(proposalId, false);
  //       const forVotes_ = (await langDAO.proposalsBasicData(proposalId)).forVotes;
  //       console.log("For Votes: ", forVotes_);

  //       console.log("voting done");
  //       // 40 blocks
  //       for (let i = 0; i < 40; i++) {
  //         await ethers.provider.send("evm_mine");
  //       }

  //       const p = await langDAO.state(proposalId);
  //       console.log("succeeded: ", p);
  //       // console.log("admin:", await timelock.admin());
  //       // console.log(admin.address);
  //       await langDAO.connect(admin).queue(proposalId);

  //       const q = await langDAO.state(proposalId);
  //       console.log("queue: ", q);

  //        await langDAO.cancel(proposalId);
  //        const cancel = await langDAO.state(proposalId);
  //       console.log("state after cancel: ",cancel);
  //     }
  //     catch(error) {
  //             console.error("An error occurred during voting:", error);
  //           }
  //   });

  //   it("is defeated if required votes are not achieved", async function(){
  //     const propB = await ethers.provider.getBalance(proposer.address);
  //     console.log("proposer eth balance: ", propB);
  //     const tokenPrice = await token.getTokenPrice();
  //     const initialContractBalance = await ethers.provider.getBalance(
  //       langDAO.address
  //     );
  //     console.log("-----> initial contract balance: ", initialContractBalance);
  //     // transfer tokens to the contract  -- 1000
  //     const tx = await token.connect(admin).transfer(langDAO.address, "1000");
  //     await tx.wait();
  //     console.log(
  //       "langDAO contract tokens: ",
  //       await token.balanceOf(langDAO.address)
  //     );

  //     const tx_ = await langDAO.connect(proposer).addMember(20, {
  //       value: 20 * tokenPrice,
  //     });
  //     console.log("proposer tokens: ", await token.balanceOf(proposer.address));

  //     await langDAO.connect(voter1).addMember(10, {
  //       value: 10 * tokenPrice,
  //     });
  //     await langDAO.connect(voter2).addMember(21, {
  //       value: 21 * tokenPrice,
  //     });
  //     await langDAO.connect(voter3).addMember(18, {
  //       value: 18 * tokenPrice,
  //     });
  //     await langDAO.connect(voter4).addMember(15, {
  //       value: 15 * tokenPrice,
  //     });

  //     await token.writeCheckpoint(voter1.address, 0, 0, 10);
  //     await token.writeCheckpoint(voter2.address, 0, 0, 21);

  //     //------------------ create a proposal---------------------------------
  //     const stakeAmount = await langDAO.proposalStake();
  //     // approve tokens
  //     await token.connect(proposer).approve(langDAO.address, stakeAmount);

  // // delegate votes
  //     await token.delegate(proposer.address);

  //     console.log(
  //       "langDAO contract balance after propose:",
  //       await ethers.provider.getBalance(langDAO.address)
  //     );
  //     const propBalance = await ethers.provider.getBalance(proposer.address);
  //     console.log("proposer eth balance: ", propBalance);
  //     const transx = await langDAO
  //       .connect(proposer)
  //       .propose(
  //         [token.address],
  //         [0],
  //         ["execute(uint)"],
  //         [ethers.utils.defaultAbiCoder.encode(["uint256"], [42])],
  //         "My Proposal Title",
  //         "Proposal of langDAO DAO",
  //         "bafybeifrwhe5h22blc33rgvcktxe3wedjq467caia23ce7toal4tym2doy",
  //         "template",
  //         { value: stakeAmount }
  //       );

  //     await transx.wait();
  //     const propBalanceAfter = await ethers.provider.getBalance(proposer.address);
  //     console.log(
  //       "proposer eth balance after (stake deducted): ",
  //       propBalanceAfter
  //     );

  //       // queue a proposal ------------------------------------------------------------------------------------

  //     const proposal = await langDAO.proposals(1);
  //     const proposalId = (await langDAO.proposals(1)).id.toNumber();
  //     ///-------------++ QUEUE ++------------------------------------------------
  //     // waiting for 1 block to pass before voting
  //     await ethers.provider.send("evm_mine");

  //     //-------------------  voting start
  //     const currentTime = (await ethers.provider.getBlock("latest")).timestamp;
  //     const futureTime = currentTime + 600;
  //     await ethers.provider.send("evm_setNextBlockTimestamp", [futureTime]);
  //     await ethers.provider.send("evm_mine");

  //     try {
  //       await langDAO.connect(voter1).castVote(proposalId, true);
  //       await langDAO.connect(voter2).castVote(proposalId, true);

  //       const forVotes_ = (await langDAO.proposalsBasicData(proposalId)).forVotes;
  //       console.log("For Votes: ", forVotes_);

  //       // 40 blocks
  //       for (let i = 0; i < 40; i++) {
  //         await ethers.provider.send("evm_mine");
  //       }

  //       const p = await langDAO.state(proposalId);
  //       console.log("state is defeated as votes are not achieved: ", p);

  //     }
  //     catch (error) {
  //             console.error("An error occurred during voting:", error);
  //           }

  //   });

  //   it("should execute a proposal if queued", async function(){

  //     const propB = await ethers.provider.getBalance(proposer.address);
  //     console.log("proposer eth balance: ", propB);
  //     const tokenPrice = await token.getTokenPrice();
  //     const initialContractBalance = await ethers.provider.getBalance(
  //       langDAO.address
  //     );
  //     console.log("-----> initial contract balance: ", initialContractBalance);

  //     await expect(
  //       langDAO.connect(proposer).addMember(2000, {
  //         value: ethers.utils.parseEther(String((2000 * tokenPrice) / 10 ** 18)),
  //       })
  //     ).to.be.revertedWith("Contract does not have enough samhitaTokens");

  //     // transfer tokens to the contract  -- 1000
  //     const tx = await token.connect(admin).transfer(langDAO.address, "1000");
  //     await tx.wait();
  //     console.log(
  //       "langDAO contract tokens: ",
  //       await token.balanceOf(langDAO.address)
  //     );

  //     await expect(
  //       langDAO.connect(proposer).addMember(6, {
  //         value: 6 * tokenPrice,
  //       })
  //     ).to.be.revertedWith(
  //       "You must purchase at least 10 tokens to become a member"
  //     );

  //     const tx_ = await langDAO.connect(proposer).addMember(20, {
  //       value: 20 * tokenPrice,
  //     });
  //     console.log("proposer tokens: ", await token.balanceOf(proposer.address));

  //     await langDAO.connect(voter1).addMember(10, {
  //       value: 10 * tokenPrice,
  //     });
  //     await langDAO.connect(voter2).addMember(21, {
  //       value: 21 * tokenPrice,
  //     });
  //     await langDAO.connect(voter3).addMember(18, {
  //       value: 18 * tokenPrice,
  //     });
  //     await langDAO.connect(voter4).addMember(15, {
  //       value: 15 * tokenPrice,
  //     });

  //     expect(await token.balanceOf(proposer.address)).to.equal("20");
  //     expect(await token.balanceOf(voter1.address)).to.equal("10");
  //     expect(await token.balanceOf(voter4.address)).to.equal("15");

  //     await token.writeCheckpoint(voter1.address, 0, 0, 10);
  //     await token.writeCheckpoint(voter2.address, 0, 0, 21);
  //     await token.writeCheckpoint(voter3.address, 0, 0, 18);
  //     await token.writeCheckpoint(voter4.address, 0, 0, 15);

  //     expect(await langDAO.isMemberAdded(proposer.address)).to.equal(true);
  //     expect(await langDAO.isMemberAdded(voter1.address)).to.equal(true);
  //     expect(await langDAO.isMemberAdded(voter2.address)).to.equal(true);
  //     expect(await langDAO.isMemberAdded(voter3.address)).to.equal(true);
  //     expect(await langDAO.isMemberAdded(voter4.address)).to.equal(true);
  //     expect(await langDAO.isMemberAdded(voter5.address)).to.equal(false);

  //     //------------------ create a proposal---------------------------------
  //     const stakeAmount = await langDAO.proposalStake();
  //     // approve tokens
  //     await token.connect(proposer).approve(langDAO.address, stakeAmount);

  // // delegate votes
  //     await token.delegate(proposer.address);

  //     console.log(
  //       "langDAO contract balance after propose:",
  //       await ethers.provider.getBalance(langDAO.address)
  //     );
  //     const propBalance = await ethers.provider.getBalance(proposer.address);
  //     console.log("proposer eth balance: ", propBalance);
  //     const transx = await langDAO
  //       .connect(proposer)
  //       .propose(
  //         [token.address],
  //         [0],
  //         ["execute(uint)"],
  //         [ethers.utils.defaultAbiCoder.encode(["uint256"], [42])],
  //         "My Proposal Title",
  //         "Proposal of langDAO DAO",
  //         "bafybeifrwhe5h22blc33rgvcktxe3wedjq467caia23ce7toal4tym2doy",
  //         "template",
  //         { value: stakeAmount }
  //       );

  //     await transx.wait();
  //     console.log("proposal created...!");
  //     const propBalanceAfter = await ethers.provider.getBalance(proposer.address);
  //     console.log(
  //       "proposer eth balance after (stake deducted): ",
  //       propBalanceAfter
  //     );

  // // queue a proposal ------------------------------------------------------------------------------------

  //     const proposal = await langDAO.proposals(1);
  //     const proposalId = (await langDAO.proposals(1)).id.toNumber();
  //     console.log("proposal ID: ", proposalId);
  //     console.log(
  //       "state after creating prop- Active: ",
  //       await langDAO.state(proposal.id)
  //     );

  //     ///-------------++ QUEUE ++------------------------------------------------
  //     // waiting for 1 block to pass before voting
  //     await ethers.provider.send("evm_mine");

  //     //-------------------  voting start
  //     const currentTime = (await ethers.provider.getBlock("latest")).timestamp;
  //     const futureTime = currentTime + 600;
  //     await ethers.provider.send("evm_setNextBlockTimestamp", [futureTime]);
  //     await ethers.provider.send("evm_mine");

  //     try {
  //       await langDAO.connect(voter1).castVote(proposalId, true);
  //       await langDAO.connect(voter2).castVote(proposalId, true);
  //       await langDAO.connect(voter3).castVote(proposalId, true);
  //       await langDAO.connect(voter4).castVote(proposalId, false);
  //       const forVotes_ = (await langDAO.proposalsBasicData(proposalId)).forVotes;
  //       // 40 blocks
  //       for (let i = 0; i < 40; i++) {
  //         await ethers.provider.send("evm_mine");
  //       }
  //       const p = await langDAO.state(proposalId);
  //       console.log("succeeded: ", p);

  //       await langDAO.connect(admin).queue(proposalId);

  //       const eta = proposal.eta.toNumber();

  //             // Increase the current time to surpass the eta
  //             await ethers.provider.send("evm_mine");

  //             //----------- Execute the proposal
  //             await langDAO.connect(admin).execute(proposalId);
  //             // await tx.wait();

  //             // console.log("Executed...!!");

  //             // const ps1 = await langDAO.state(proposalId);
  //             // console.log("State after executing: " + ps1);

  //     }
  //     catch (error) {
  //       console.error("An error occurred during voting:", error);
  //     }

  //   });

  //   it("should give member NFT", async function(){

  //     const propB = await ethers.provider.getBalance(proposer.address);
  //     console.log("proposer eth balance: ", propB);
  //     const tokenPrice = await token.getTokenPrice();
  //     const initialContractBalance = await ethers.provider.getBalance(
  //       langDAO.address
  //     );
  //     console.log("-----> initial contract balance: ", initialContractBalance);

  //     // transfer tokens to the contract  -- 1000
  //     const tx = await token.connect(admin).transfer(langDAO.address, "1000");
  //     await tx.wait();
  //     console.log(
  //       "langDAO contract tokens: ",
  //       await token.balanceOf(langDAO.address)
  //     );

  //     const tx_ = await langDAO.connect(proposer).addMember(20, {
  //       value: 20 * tokenPrice,
  //     });

  //     await langDAO.connect(voter1).addMember(10, {
  //       value: 10 * tokenPrice,
  //     });
  //     await langDAO.connect(voter2).addMember(21, {
  //       value: 21 * tokenPrice,
  //     });
  //     await langDAO.connect(voter3).addMember(18, {
  //       value: 18 * tokenPrice,
  //     });
  //     await langDAO.connect(voter4).addMember(15, {
  //       value: 15 * tokenPrice,
  //     });

  //     expect(await token.balanceOf(proposer.address)).to.equal("20");
  //     expect(await token.balanceOf(voter1.address)).to.equal("10");
  //     expect(await token.balanceOf(voter2.address)).to.equal("21");
  //     expect(await token.balanceOf(voter3.address)).to.equal("18");
  //     expect(await token.balanceOf(voter4.address)).to.equal("15");

  //     await token.writeCheckpoint(voter1.address, 0, 0, 10);
  //     await token.writeCheckpoint(voter2.address, 0, 0, 21);
  //     await token.writeCheckpoint(voter3.address, 0, 0, 18);
  //     await token.writeCheckpoint(voter4.address, 0, 0, 15);

  //     //------------------ create a proposal---------------------------------
  //     const stakeAmount = await langDAO.proposalStake();
  //     // approve tokens
  //     await token.connect(proposer).approve(langDAO.address, stakeAmount);
  //     await
  //     // delegate votes
  //     await token.delegate(proposer.address);

  //     console.log(
  //       "langDAO contract balance after propose:",
  //       await ethers.provider.getBalance(langDAO.address)
  //     );
  //     const propBalance = await ethers.provider.getBalance(proposer.address);
  //     console.log("proposer eth balance: ", propBalance);
  //     const proposalId = (await langDAO.proposals(1)).id.toNumber();
  //       log
  //     const transx = await langDAO
  //       .connect(proposer)
  //       .propose(
  //         [token.address],
  //         [0],
  //         ["execute(uint)"],
  //         [ethers.utils.defaultAbiCoder.encode(["uint256"], [42])],
  //         "My Proposal Title",
  //         "Proposal of langDAO DAO",
  //         "bafybeifrwhe5h22blc33rgvcktxe3wedjq467caia23ce7toal4tym2doy",
  //         "template",
  //         { value: stakeAmount }
  //       );

  //     await transx.wait();
  //     console.log("proposal created...!");
  //     console.log("--->>>" , proposalId);
  //     const print = await langDAO.proposals[proposalId];
  //     console.log(print);

  //   });

  // });
});
