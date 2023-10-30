// const { ethers } = require("hardhat");
// const { expect } = require("chai");

// describe("samhitaToken", function () {
//   let Token;
//   let admin;
//   let user1, user2;
//   let token;

//   beforeEach(async function () {
//     Token = await ethers.getContractFactory("samhitaToken");
//     const initialSupply = ethers.utils.parseUnits("1000", 18);

//     [admin, user1, user2] = await ethers.getSigners();
//     token = await Token.connect(admin).deploy(initialSupply);
//     await token.deployed();
//   });

//   it("should have propoer initial values", async function () {
//     // console.log("admin in samhitaToken: "+ admin.address);
//     // console.log("Samhita Token : "+token.address);
//     expect(await token.name()).to.equal("MyToken");
//     expect(await token.symbol()).to.equal("MTK");

//     const totalSupply = await token.totalSupply();
//     // console.log("total------", totalSupply);
//     const expectedTotalSupply = ethers.utils.parseUnits("1000", 18);

//     expect(totalSupply).to.equal(expectedTotalSupply);
//   });

//   it("should transfer tokens between accounts", async function () {
//     const amount = ethers.utils.parseUnits("100", 18);
//     // Check user1's balance before the transfercon
//     const user1BalanceBefore = await token.balanceOf(await user1.address);
//     // Transfer tokens from admin to user1
//     // console.log(await token.balanceOf(await admin.address));
//     await token.connect(admin).transfer( user1.address, amount);
//     const user1BalanceAfter = await token.balanceOf(await user1.address);
//     expect(user1BalanceAfter.sub(user1BalanceBefore)).to.equal(amount);
//   });

//   //      //--> transfer from
//   it("should transfer tokens using transferFrom ", async function () {
//     const amount = ethers.utils.parseUnits("100", 18);

//     //approve user1 to spend tokens on behalf of admin
//     await token.connect(admin).approve(user1.address, amount);
//     // u1 transfer from admin to u2
//     await token
//       .connect(user1)
//       .transferFrom(admin.address, user2.address, amount);
//         // check u2 received
//     expect(await token.balanceOf(await user2.address)).to.equal(amount);
//         // checking that both u1 and admin has 0 balance
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
//     const amount = ethers.utils.parseUnits("100", 18);
//     //approve user1 to spend tokens on behalf of admin
//     await token.connect(admin).approve(user1.address, amount);

//     const adminInitBal = await token.balanceOf(admin.address);
//     const user1InitBal = await token.balanceOf(user1.address);
//     // transferFrom : admin  to user1
//     await token
//       .connect(user1)
//       .transferFrom(admin.address, user2.address, amount);
//     //  checking new balance

//     expect(await token.balanceOf(admin.address)).to.equal(
//       "900000000000000000000"
//     );
//     expect(await token.balanceOf(user2.address)).to.equal(
//       "100000000000000000000"
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
//     // console.log(priorVotes);
//     expect(priorVotes).to.equal(0);
//   });

//   //--> transfer from
//   it("should transfer tokens using transferFrom ", async function () {
//     const amount = ethers.utils.parseUnits("100", 18);
//     //approve user1 to spend tokens on behalf of admin
//     await token.connect(admin).approve(user1.address, amount);
//     // u1 transfer from admin to u2
//     await token
//       .connect(user1)
//       .transferFrom(admin.address, await user2.address, amount);
//     // check u2 received
//     expect(await token.balanceOf(user2.address)).to.equal(amount);
//     // checking that both u1 and admin has 0 balance
//     expect(await token.allowance(admin.address, await user1.address)).to.equal(
//       0
//     );
//   });

//   // revert if transfer more tokens than allowance
//   it("should not allow transfer if allowance is exceeded", async function () {
//     // Decrease the allowance to a smaller value that is within the valid range
//     allowance = ethers.utils.parseUnits("999", 18);

//     // Approve user1 to spend tokens on behalf of admin with the smaller allowance
//     await token.connect(admin).approve(user1.address, allowance);

//     // Try to transfer more tokens than the allowance
//     await expect(
//       token
//         .connect(user1)
//         .transferFrom(admin.address, user2.address, allowance + 1)
//     ).to.be.revertedWith("ERC20: insufficient allowance");

//     // Check that user2 didn't receive any tokens
//     expect(await token.balanceOf(user2.address)).to.equal(0);
//   });

//   //              // not alloww transfer from and to zero address

//   //           // it("should not allow transfer from and to zero address", async function(){
//   //           //   const amount = ethers.utils.parseUnits("1000", 18);

//   //           //   // should not transfer from a 0 address to user1
//   //           //   await expect(
//   //           //     token.connect(admin).transferTokens(ethers.constants.AddressZero, await user1.address, amount)
//   //           //   ).to.be.revertedWith("cannot transfer from 0 address");

//   //           //   // not vice-versa
//   //           //   await expect(
//   //           //       token.connect(admin).transferTokens( await user1.address,ethers.constants.AddressZero, amount)
//   //           //     ).to.be.revertedWith("cannot transfer to 0 address");
//   //           // });

//   // it("Should return the latest checkpoint's votes for an account", async function () {
//   //              const amount = ethers.utils.parseUnits("1000", 18);

//   //   // Transfer tokens to user1 and delegate voting power
//   //      await token.connect(admin).transferFrom( admin.address,  user1.address, amount);
//   //      await token.connect(user1).delegate( user2.address);

//   //         // Check the current votes for user1 (latest checkpoint)
//   //       const currVotes1 = await token.getCurrentVotes( user1.address);
//   //       expect(currVotes1).to.equal(0);

//   //       const currVotes2 = await token.getCurrentVotes( user2.address);
//   //       expect(currVotes2).to.equal(amount);
//   //      });

//   // PRIOR VOTES

//   it("Should return 0 votes for an account before any checkpoints", async function () {
//     // Get the block number
//     const blockNumber = await ethers.provider.getBlockNumber();

//     // Check the prior votes for an account before any checkpoints
//     const priorVotes = await token.getPriorVotes(
//       await user1.address,
//       blockNumber - 1
//     );
//     expect(priorVotes).to.equal(0);
//   });

//   // it("Should return the latest checkpoint's votes for a recent block", async function () {
//   //   const amount = ethers.utils.parseUnits("1000", 18);
//   //   const checkpointsData = [
//   //     { blockNumber: 1000, votes: 100 },
//   //     { blockNumber: 1500, votes: 200 },
//   //     { blockNumber: 2000, votes: 300 },
//   //   ];

//   //   // Transfer tokens to user1 and delegate voting power
//   //   await token.connect(admin).transferFrom(await admin.address, await user1.address, amount);
//   //   await token.connect(user1).delegate(await admin.address);
//   //   const currentBlock = await ethers.provider.getBlockNumber();
//   //   const historicalBlock = currentBlock - 1; // Use a block lower than the current block

//   //   // Check the prior votes for user1 at the specified historical block
//   //   const priorVotes = await token.getPriorVotes(await user1.address, historicalBlock);
//   //   const priorVotess = ethers.utils.parseEther(priorVotes);
//   //   expect(priorVotess).to.equal(amount);
//   // });

//   // it("Should create demo checkpoints with specified votes", async function () {
//   //   // Specify the address for which you want to create checkpoints
//   //   const accountToCheckpoint = user1.address;

//   //   // Specify the historical block numbers and votes
//   //   const checkpointsData = [
//   //     { blockNumber: 1000, votes: 100 },
//   //     { blockNumber: 1500, votes: 200 },
//   //     { blockNumber: 2000, votes: 300 },
//   //   ];

//   //   for (const { blockNumber, votes } of checkpointsData) {
//   //     await token.writeCheckpoint(accountToCheckpoint, blockNumber, 0, votes); // You need to provide all four arguments here
//   //   }
//   //         // 10 blocks
//   //   for (let i = 0; i < 10; i++) {
//   //     await ethers.provider.send("evm_mine");
//   //   }

//   //   // Check the prior votes for user1 at different historical blocks
//   //   expect(await token.getPriorVotes(accountToCheckpoint, 900)).to.equal(0);
//   //   expect(await token.getPriorVotes(accountToCheckpoint, 1100)).to.equal(100);
//   //   expect(await token.getPriorVotes(accountToCheckpoint, 1600)).to.equal(200);
//   //   expect(await token.getPriorVotes(accountToCheckpoint, 2100)).to.equal(300);
//   // });

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
//     const amount = ethers.utils.parseUnits("100", 18);
//     //approve user1 to spend tokens on behalf of admin
//     await token.connect(admin).approve(user1.address, amount);
//     // u1 transfer from admin to u2
//     await token
//       .connect(user1)
//       .transferFrom(admin.address, user1.address, amount);
//     //   console.log("u1", await token.balanceOf(user1.address));   // 100

//     await token.delegate(user2.address);
//     console.log("balance of userr2: ", await token.balanceOf(user1.address));
    
//   });

// //   it("should move delegates from user1 to user2 using move delegates", async function () {
// //     // Mint 100 tokens to user1 and set user1 as delegate for some votes
// //     const amount = ethers.utils.parseUnits("100", 18);
// //     await token.connect(admin).approve(user1.address, amount);
// //     // u1 transfer from admin to u2
// //     await token
// //       .connect(user1)
// //       .transferFrom(admin.address, user1.address, amount);
// //           await token.connect(user1).delegate(user1.address);

// //     // Check user1's voting power before the move
// //     const user1InitVotes = await token.getCurrentVotes(user1.address);

// //     // Perform the delegate transfer from user1 to user2
// //     await token.connect(user1).moveDelegates(user1.address, user2.address, amount);

// //     // Check user1's voting power after the move
// //     const user1FinalVotes = await token.getCurrentVotes(user1.address);

// //     // Check user2's voting power after the move
// //     const user2FinalVotes = await token.getCurrentVotes(user2.address);

// //     // Ensure that user1's voting power has decreased
// //     expect(user1FinalVotes).to.be.lt(user1InitVotes);

// //     // Ensure that user2's voting power has increased
// //     expect(user2FinalVotes).to.be.gt(0);
// //   });

// //     it("should delegate voting power and update delegates", async function () {
// //       const currentDelegate = await token.delegate(admin.address );
// //       const currentDelegateeVotes = await token.getCurrentVotes(user1.address );

// //       // Delegate voting power to user1
// //       await token.connect(admin).delegate(user1.address );

// //       const newDelegate = await token.delegate(user1.address );
// //       console.log("new");
// //       console.log(newDelegate);
// //       const delegateeVotes = await token.getCurrentVotes(user1.address);
// //       console.log(delegateeVotes);

// //       expect(newDelegate).to.equal(user1.address, "Delegate should be updated");
// //       expect(delegateeVotes).to.be.gt(currentDelegateeVotes, "user1 votes should increase");
// //   });

   

//             /// CHECKPOINT

// //    it("Should create an intermediate checkpoint if the last checkpoint is before the current block", async function () {
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

// //     });  
// });
