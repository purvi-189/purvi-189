// const { ethers } = require("hardhat");
// const { expect } = require("chai");

// describe("langDAOToken", function () {
//   let Token;
//   let admin;
//   let user1, user2;
//   let token;
//   let timelock, templateNFT;

//   beforeEach(async function () {
//     [admin, user1, user2] = await ethers.getSigners();

//     const MIN_DELAY = 600;
//     // time lock contract
//     const Timelock = await ethers.getContractFactory("Timelock");
//     timelock = await Timelock.connect(admin).deploy(MIN_DELAY);
//     await timelock.deployed();

//     // template nft contract
//     const TemplateNFT = await ethers.getContractFactory("TemplateNFT");
//     templateNFT = await TemplateNFT.deploy();
//     await templateNFT.deployed();

//     Token = await ethers.getContractFactory("LanguageDAOToken");
//     token = await Token.connect(admin).deploy(
//       "MyLangToken",
//       "MLT",
//       "1000000000000000000000"
//     );
//     await token.deployed();

//     LangDAO = await ethers.getContractFactory("LanguageDAO");
//     langDAO = await LangDAO.connect(admin).deploy(
//       timelock.address,
//       token.address,
//       templateNFT.address,
//       "nft uri of lang dao"
//     );
//   });

//   it("Should have correct initial values", async function () {
//     // console.log("admin in langDAOToken: "+ admin.address);
//     // console.log("Lang DAO Token : "+token.address);
//     expect(await token.name()).to.equal("MyLangToken");
//     expect(await token.symbol()).to.equal("MLT");

//     const totalSupply = await token.totalSupply();
//     console.log(totalSupply);
//     // const expectedTotalSupply = ethers.utils.parseUnits("1000", 18);
//     // expect(expectedTotalSupply).to.equal("1000");
//   });

//   it("should transfer tokens between accounts", async function () {
//     const amount = ethers.utils.parseUnits("100", 18);
//     // Check user1's balance before the transfercon
//     const user1BalanceBefore = await token.balanceOf(await user1.address);
//     // Transfer tokens from admin to user1
//     // console.log(await token.balanceOf(await admin.address));
//     await token.connect(admin).transfer(user1.address, amount);
//     const user1BalanceAfter = await token.balanceOf(await user1.address);
//     expect(user1BalanceAfter.sub(user1BalanceBefore)).to.equal(amount);
//   });

//   //--> transfer from
//   it("should transfer tokens using transferFrom ", async function () {
//     const amount = ethers.utils.parseUnits("100", 18);

//     //approve user1 to spend tokens on behalf of admin
//     await token.connect(admin).approve(user1.address, amount);
//     // u1 transfer from admin to u2
//     await token
//       .connect(user1)
//       .transferFrom(admin.address, user2.address, amount);
//     // check u2 received
//     expect(await token.balanceOf(await user2.address)).to.equal(amount);
//     // checking that both u1 and admin has 0 balance
//     expect(
//       await token.allowance(await admin.address, await user1.address)
//     ).to.equal(0);
//   });

//   // revert if transfer more tokens than allowance
//   it("should not allow transfer if allowance is exceeded", async function () {
//     // Decrease the allowance to a smaller value that is within the valid range
//     const allowance = ethers.utils.parseUnits("999", 18);
//     console.log("--> ", await token.balanceOf(admin.address));
//     // Approve user1 to spend tokens on behalf of admin with the smaller allowance
//     await token.connect(admin).approve(await user1.address, allowance);

//     // Try to transfer more tokens than the allowance
//     await expect(
//       token
//         .connect(user1)
//         .transferFrom(admin.address, user2.address, allowance + 1)
//     ).to.be.revertedWith("ERC20: insufficient allowance");

//     // Check that user2 didn't receive any tokens
//     expect(await token.balanceOf(await user2.address)).to.equal(0);
//   });

//   //  Transfer Tokens
//   it("should transfer tokens and updates balance", async function () {
//     const adminInitBal = await token.balanceOf(admin.address);
//     const user1InitBal = await token.balanceOf(user1.address);
//     const amount = ethers.utils.parseUnits("1000", 18); // admin

//     // transferFrom : admin  to user1
//     await token.connect(admin).transfer(user1.address, amount);
//     //  checking new balance
//     expect(await token.balanceOf(admin.address)).to.equal(
//       adminInitBal - amount
//     );
//     expect(await token.balanceOf(user1.address)).to.equal(
//       user1InitBal + amount
//     );
//   });

//   /// -----> CURRENT VOTES

//   it("should return zero for an acc that has no checkPoint", async function () {
//     const currVotes = await token.getCurrentVotes(await user2.address);
//     expect(currVotes).to.equal(0);
//   });

//   it("Should return 0 votes for an acc with no voting power", async function () {
//     const currVotes = await token.getCurrentVotes(await user2.address);
//     expect(currVotes).to.equal(0);
//   });

//   it("should return correct prior votes", async function () {
//     const account = "0xF9da412Cc753e3E18E6428286b5677C0E301BE3d";
//     const currentBlock = await ethers.provider.getBlockNumber();
//     const priorVotes = await token.getPriorVotes(account, currentBlock - 1);
//     expect(priorVotes).to.equal(0);
//   });

//   //--> transfer from
//   it("should transfer tokens using transferFrom ", async function () {
//     const amount = ethers.utils.parseUnits("100", 18);

//     //approve user1 to spend tokens on behalf of admin
//     await token.connect(admin).approve(await user1.address, amount);

//     // u1 transfer from admin to u2
//     await token
//       .connect(user1)
//       .transferFrom(await admin.address, await user2.address, amount);
//     // check u2 received
//     expect(await token.balanceOf(await user2.address)).to.equal(amount);
//     // checking that both u1 and admin has 0 balance
//     expect(
//       await token.allowance(await admin.address, await user1.address)
//     ).to.equal(0);
//   });

//   // revert if transfer more tokens than allowance
//   it("should not allow transfer if allowance is exceeded", async function () {
//     // Decrease the allowance to a smaller value that is within the valid range
//     allowance = ethers.utils.parseUnits("999", 18);
//     // Approve user1 to spend tokens on behalf of admin with the smaller allowance
//     await token.connect(admin).approve(user1.address, allowance);

//     // Try to transfer more tokens than the allowance
//     await expect(
//       token.connect(user1).transfer(user2.address, allowance + 1)
//     ).to.be.revertedWith("ERC20: transfer amount exceeds balance");

//     // Check that user2 didn't receive any tokens
//     expect(await token.balanceOf(user2.address)).to.equal(0);
//   });
//   //  Transfer Tokens
//   it("should transfer tokens and updates balance", async function () {
//     const adminInitBal = await token.balanceOf(await admin.address);
//     const user1InitBal = await token.balanceOf(await user1.address);
//     const amount = ethers.utils.parseUnits("1000", 18); // admin

//     // transferFrom : admin  to user1
//     await token.connect(admin).transfer(user1.address, amount);
//     // checking new balance
//     expect(await token.balanceOf(admin.address)).to.equal(
//       adminInitBal - amount
//     );
//     expect(await token.balanceOf(user1.address)).to.equal(
//       user1InitBal + amount
//     );
//   });

//   it("should return zero for an acc that has no checkPoint", async function () {
//     const currVotes = await token.getCurrentVotes(await user2.address);
//     expect(currVotes).to.equal(0);
//   });

//   it("Should return 0 votes for an acc with no voting power", async function () {
//     const currVotes = await token.getCurrentVotes(await user2.address);
//     expect(currVotes).to.equal(0);
//   });

//   // /// -----> CURRENT VOTES

//   // it("Should return the latest checkpoint's votes for an account", async function () {
//   //   const amount = ethers.utils.parseUnits("1000", 18);

//   //   // Transfer tokens to user1 and delegate voting power
//   //   await token
//   //     .connect(admin)
//   //     .transferTokens(await admin.address, await user1.address, amount);
//   //   await token.connect(user1).delegate( user2.address);

//   //   // Check the current votes for user1 (latest checkpoint)
//   //   const currVotes1 = await token.getCurrentVotes( user1.address);
//   //   expect(currVotes1).to.equal(0);

//   //   const currVotes2 = await token.getCurrentVotes( user2.address);
//   //   expect(currVotes2).to.equal(amount);
//   // });

//   // PRIOR VOTES

//   it("Should return 0 votes for an account before any checkpoints", async function () {
//     // Get the block number
//     const blockNumber = await ethers.provider.getBlockNumber();

//     // Check the prior votes for an account before any checkpoints
//     const priorVotes = await token.getPriorVotes(
//       user1.address,
//       blockNumber - 1
//     );
//     expect(priorVotes).to.equal(0);
//   });

//   /// DELEGATE
//   it("should delegate voting power from admin to user", async function () {
//     const initialBalance = ethers.utils.parseUnits("1000", 18);

//     // Delegate voting power from admin to user1
//     await token.connect(admin).delegate(user1.address);

//     // Check the delegate of admin
//     expect(await token.delegates(admin.address)).to.equal(user1.address);

//     // initial and updated voting power of user1
//     expect(await token.getCurrentVotes(user1.address)).to.equal(initialBalance);
//     expect(await token.getCurrentVotes(admin.address)).to.equal(0);
//   });

//   it("should move delegates from user1 to user2", async function () {
//         const amount = ethers.utils.parseUnits("100", 18);
//         //approve user1 to spend tokens on behalf of admin
//         await token.connect(admin).approve(user1.address, amount);
//         // u1 transfer from admin to u2
//         await token
//           .connect(user1)
//           .transferFrom(admin.address, user1.address, amount);    
//         await token.delegate(user2.address);
//         console.log("balance of userr2: ", await token.balanceOf(user1.address));
        
//       });


// });

// //     //   it("Should return the latest checkpoint's votes for a recent block", async function () {
// //     //   const amount = ethers.utils.parseUnits("1000", 18);

// //     //   // Transfer tokens to user1 and delegate voting power
// //     //   await token.connect(admin).transferTokens(await admin.address, await user1.address, amount);
// //     //   await token.connect(user1).delegate(await admin.address);

// //     //   // Get the block number
// //     //   const blockNumber = await ethers.provider.getBlockNumber();

// //     //   // Check the prior votes for user1 at the current block (latest checkpoint)
// //     //   const priorVotes = await token.getPriorVotes(await user1.address, blockNumber);
// //     //   expect(priorVotes).to.equal(amount);
// //     // });

// //     // it("Should return the latest checkpoint's votes for a recent block", async function () {
// //     //   const amount = ethers.utils.parseUnits("1000", 18);
// //     //   const checkpointsData = [
// //     //     { blockNumber: 1000, votes: 100 },
// //     //     { blockNumber: 1500, votes: 200 },
// //     //     { blockNumber: 2000, votes: 300 },
// //     //   ];

// //     //   // Transfer tokens to user1 and delegate voting power
// //     //   await token.connect(admin).transferTokens(await admin.address, await user1.address, amount);
// //     //   await token.connect(user1).delegate(await admin.address);
// //     //   const currentBlock = await ethers.provider.getBlockNumber();
// //     //   const historicalBlock = currentBlock - 1; // Use a block lower than the current block

// //     //   // Check the prior votes for user1 at the specified historical block
// //     //   const priorVotes = await token.getPriorVotes(await user1.address, historicalBlock);
// //     //   const priorVotess = ethers.utils.parseEther(priorVotes);
// //     //   expect(priorVotess).to.equal(amount);
// //     // });

// //     it("Should create demo checkpoints with specified votes", async function () {
// //       // Specify the address for which you want to create checkpoints
// //       const accountToCheckpoint = user1.address;

// //       // Specify the historical block numbers and votes
// //       const checkpointsData = [
// //         { blockNumber: 1000, votes: 100 },
// //         { blockNumber: 1500, votes: 200 },
// //         { blockNumber: 2000, votes: 300 },
// //       ];

// //       for (const { blockNumber, votes } of checkpointsData) {
// //         await token.writeCheckpoint(accountToCheckpoint, blockNumber, 0, votes); // You need to provide all four arguments here
// //       }
// //             // 10 blocks
// //       for (let i = 0; i < 10; i++) {
// //         await ethers.provider.send("evm_mine");
// //       }

// //       // Check the prior votes for user1 at different historical blocks
// //       expect(await token.getPriorVotes(accountToCheckpoint, 900)).to.equal(0);
// //       expect(await token.getPriorVotes(accountToCheckpoint, 1100)).to.equal(100);
// //       expect(await token.getPriorVotes(accountToCheckpoint, 1600)).to.equal(200);
// //       expect(await token.getPriorVotes(accountToCheckpoint, 2100)).to.equal(300);
// //     });

// //      /* it("should move Delegates", async function(){
// //             const amount = ethers.utils.parseUnits("1000", 18);
// //             await token.connect(admin).transferTokens(await admin.address, await user1.address, amount);
// //                 // Move delegates and update voting power
// //           console.log(await token.balanceOf(user1.address ));
// //          await token.connect(user1).moveDelegates(await user1.address, await user2.address, amount);
// //           console.log(await token.balanceOf(user1.address ));

// //           // Check updated voting power of admin and user2
// //                 // const user1V = await token.getCurrentVotes(await user1.address);
// //                 // const user2V = await token.getCurrentVotes(await user2.address);
// //                 // expect(user1V).to.equal(0);
// //                 //  expect(user2V).to.equal(1000);
// //         }) ;
// //           */

// //         it("Should emit DelegateChanged event and update delegates", async function () {
// //                       const amount = ethers.utils.parseUnits("1000", 18);
// //                       await token.connect(admin).transferTokens(await admin.address, await user1.address, amount);

// //                       // Delegate voting power from user1 to user2
// //                       const tx = await token.connect(user1).delegate(await user2.address);

// //                       // Expect DelegateChanged event to be emitted
// //                       await expect(tx).to.emit(token, "DelegateChanged")
// //                         .withArgs(await user1.address, ethers.constants.AddressZero, await user2.address);
// //                       // Checking the delegate of user1
// //                       const user1Delegate = await token.delegates(await user1.address);
// //                       expect(user1Delegate).to.equal(await user2.address);
// //                     });

// //                  //           /// CHECKPOINT

// //   /* it("Should create an intermediate checkpoint if the last checkpoint is before the current block", async function () {
// //     const amount = ethers.utils.parseUnits("1000", 18);

// //     // Transfer tokens to user1 and delegate voting power
// //     await token.connect(admin).transferTokens(await admin.address, await user1.address, amount);
// //     await token.connect(user1).delegate(await admin.address);

// //     const blockNum  = await ethers.provider.getBlockNumber();
// //     // Move forward to a new block
// //     await ethers.provider.send("evm_mine");

// //     // Write a new checkpoint for user1 after moving to a new block
// //     await token.connect(admin).writeCheckpoint(await user1.address, 2, amount, amount * 2);

// //     // Check the new checkpoint for use

// //     const user1Checkpoints = await token.checkpoints(await user1.address, 1);
// //     expect(user1Checkpoints.fromBlock).to.equal(blockNumber + 1);
// //     expect(user1Checkpoints.votes).to.equal(amount);
