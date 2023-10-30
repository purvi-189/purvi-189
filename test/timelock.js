// const { expect } = require('chai');
// const { ethers, upgrades } = require('hardhat');

// describe('Timelock', function () {
//   let Timelock;
//   let timelock;
//   let admin;
//   let nonAdmin;
//   let pendingAdmin;
//   let currTime;   let user; let token;

//   beforeEach(async function () {

//     [admin, pendingAdmin, nonAdmin] = await ethers.getSigners();
//         const initialSupply = ethers.utils.parseUnits("1000", 18);

//     // const MIN_DELAY = 600;
//     Timelock = await ethers.getContractFactory("Timelock");
//     timelock = await Timelock.connect(admin).deploy(660);

//     const Token = await ethers.getContractFactory("samhitaToken");
//     token = await Token.connect(admin).deploy(initialSupply);

//     // const Samhita = await ethers.getContractFactory("Samhita");
//     // samhita = await Samhita.connect(admin).deploy(timelock.address, token.address);


//   });

//   it('Should deploy the Timelock contract with a valid delay', async function () {
//      console.log("Timelock add: "+timelock.address);
//    console.log("Owner in Timelock: "+admin.address);

//     const delay = 10* 60; // 10min in seconds
//     timelock = await Timelock.deploy(delay);
    
//     expect(await timelock.delay()).to.equal(delay);
//   });

//   it('Should revert when deploying Timelock with a delay less than minimum', async function () {
//     const invalidTime = 5; // Less than the minimum delay
//     await expect(Timelock.deploy(invalidTime)).to.be.revertedWith(' Delay must exceed minimum delay.');
//   });

//   it('Should revert when deploying Timelock with a delay greater than maximum', async function () {
//     const invalidTime = 18*60; // more than max = 15
//     await expect(Timelock.deploy(invalidTime)).to.be.revertedWith(' Delay must not exceed maximum delay.');
//   });

//     // it('Should set admin when acceptAdmin is called by pendingAdmin', async function () {
//     //   await timelock.connect(pendingAdmin).acceptAdmin();
  
//     //  expect( await timelock.admin(admin)).to.equal(pendingAdmin.address);
//     //  expect(await  timelock.pendingAdmin()).to.equal(ethers.constants.AddressZero);
//     // });

//     //   it('Should revert when acceptAdmin is called by a non-pendingAdmin', async function () {
//     //       const nonPendingAdmin = await ethers.getSigner();
//     //       await expect(timelock.connect(nonPendingAdmin).acceptAdmin()).to.be.revertedWith('Call must come from pendingAdmin.');
//     //     });


//        //  1) admin and valid time
//   it('should  queue trans when called by admin', async function(){

//     const signature = "executeProposal(uint256)"; // Function signature
//     const data = ethers.utils.defaultAbiCoder.encode(['uint256'],[42]); 
//     currTime = await timelock.getBlockTimestamp();

//     const eta = currTime.add(12*60); 
//      expect(await timelock.connect(admin).queueTransaction( token.address, 0 , signature, data, eta)  );
 
// });

//     // 2) non Admin 
//     it('should  revert when nonAdmin tries to queue a trans', async function(){
//         const signature = "executeProposal(uint256)"; // Function signature
//         const data = ethers.utils.defaultAbiCoder.encode(['uint256'],[42]); 

//         currTime = await timelock.getBlockTimestamp();
    
//         const eta = currTime.add(12*60); 
//         await expect(timelock.connect(nonAdmin).queueTransaction(token.address , 0 , signature, data, eta) )
//               .to.be.revertedWith("Call must come from admin.");
//       });


//       // 3) admin and invalid time
//     it('should  revert when admin calls but time is not valid', async function(){
//         currTime = await timelock.getBlockTimestamp();
//         const signature = "executeProposal(uint256)"; // Function signature
//         const data = ethers.utils.defaultAbiCoder.encode(['uint256'],[42]); 
    
//         const eta = currTime.add(5*60); 

//       await expect(timelock.connect(admin).queueTransaction(token.address , 0 , signature, data, eta)
//         ).to.be.revertedWith("Estimated execution block must satisfy delay.")
//       })
//         // 4) confirming the call of admin

//     it('should  queue trans when called by admin', async function(){
//         const signature = "executeProposal(uint256)"; // Function signature
//         const data = ethers.utils.defaultAbiCoder.encode(['uint256'],[42]); 

//         currTime = await timelock.getBlockTimestamp();
    
//         const eta = currTime.add(12*60); 
//       expect(await timelock.connect(admin).queueTransaction(token.address , 0 , signature, data, eta)).to.be.revertedWith("Call must come from admin.") ;
//       })

//     // it('Estimated execution block must satisfy delay', async function(){

//     //     const signature = "executeProposal(uint256)"; // Function signature
//     //     const data = ethers.utils.defaultAbiCoder.encode(['uint256'],[42]); 
//     //     currTime = await timelock.getBlockTimestamp();
//     //     const eta = currTime.add(601); 
//     //     expect(await timelock.connect(admin).queueTransaction(token.address , 0 , signature, data, eta) ).to.be.revertedWith('Estimated execution block must satisfy delay');
//     // });

   
//       //-------------> CANCEL TRANS
//     it("should cancel queued trans when called by admin", async function(){
//         // adding trans to queue 
//     const signature = "executeProposal(uint256)"; // Function signature
//     const data = ethers.utils.defaultAbiCoder.encode(['uint256'],[42]); 
//     currTime = await timelock.getBlockTimestamp();
//     const eta = currTime.add(12*60);

//        const tx = await timelock.connect(admin).queueTransaction(token.address , 0 , signature, data, eta);
//       expect(await timelock.connect(admin).cancelTransaction(token.address , 0 , signature, data, eta));
//     });

//     //  revert when nonAdmin tries to cancel
//      it("should revert when non-admin tries to cancel", async function(){
//       currTime = await timelock.getBlockTimestamp();
//       const eta = currTime.add(12*60); 
    
//       const signature = "executeProposal(uint256)"; // Function signature
//       const data = ethers.utils.defaultAbiCoder.encode(['uint256'],[42]); 
    
//       // Adding trans to queue 
//       const txHash = await timelock.connect(admin).queueTransaction(token.address, 0, signature, data, eta);
//       await expect(  timelock.connect(nonAdmin).cancelTransaction(token.address, 0, signature, data, eta) ).to.be.revertedWith("Call must come from admin.");
//     });


//          // ================EXECUTE
//     //   execute when called by admin
//       it("Should execute a transaction when called by admin", async function(){
        
//         currTime = await timelock.getBlockTimestamp();
//          const eta = currTime.add(12*60); 
//          const signature = "executeProposal(uint256)"; // Function signature
//          const data = ethers.utils.defaultAbiCoder.encode(['uint256'],[42]); 
  
//           // adding trans to queue 
//       const txHash =await timelock.connect(admin).queueTransaction(token.address , 0 , signature, data, eta);
//       await ethers.provider.send('evm_increaseTime', [12*60] );
//       await expect(timelock.connect(nonAdmin).executeTransaction(token.address , 0 , signature, data, eta)).to.be.revertedWith("Call must come from admin.") ;
//     });

//       /// revert when not callled by admin

//       it("Should revert when not called by admin", async function(){
//         currTime = await timelock.getBlockTimestamp();
//          const eta = currTime.add(12*60); 
  
//          const signature = "executeProposal(uint256)"; // Function signature
//          const data = ethers.utils.defaultAbiCoder.encode(['uint256'],[42]); 
  
//           // adding trans to queue 
//          await timelock.connect(admin).queueTransaction(token.address , 0 , signature, data, eta);
//          await ethers.provider.send('evm_increaseTime', [12*60] );

//          await expect( timelock.connect(nonAdmin).executeTransaction(token.address , 0 , signature, data, eta) ).to.be.revertedWith("Call must come from admin.");
//         });

            
//       it("should revert trans is not queued", async function(){

//         currTime = await timelock.getBlockTimestamp();
//         const eta = currTime.add(12*60); 
 
//         const signature = "executeProposal(uint256)"; // Function signature
//         const data = ethers.utils.defaultAbiCoder.encode(['uint256'],[42]); 
//         await expect( timelock.connect(admin).executeTransaction(token.address , 0 , signature, data, eta) ).to.be.revertedWith("Transaction hasn't been queued.") ;
//       });


//      it("should revert when trans hasn't surpassed timelock", async function(){
//              const signature = "executeProposal(uint256)";
//               const data = ethers.utils.defaultAbiCoder.encode(["uint256"], [42]);
              
//                 // Queue the transaction with an ETA in the future
//                 const currTime = await timelock.getBlockTimestamp();
//                 const eta = currTime.add(12 * 60); 
              
//                 // await timelock.connect(admin).SetTempSender(admin.address); 
//                 const tx = await timelock.connect(admin).queueTransaction(token.address, 0, signature, data, eta);
//                await expect( timelock.connect(admin).executeTransaction(token.address, 0, signature, data, eta ) ).to.be.revertedWith("Transaction hasn't surpassed timelock.");
//               });

//               it("should revert when trans is stale", async function () {
//                     const signature = "executeProposal(uint256)";
//                     const data = ethers.utils.defaultAbiCoder.encode(["uint256"], [42]);
                       
//                   // Queue the transaction with an ETA in the future
//                       const currTime = await timelock.getBlockTimestamp();
//                       const eta = currTime.add(13 * 60); // Set ETA 13 minutes in the future
                      
//                      const tx = await timelock.connect(admin).queueTransaction("0xF8cd1A0CC0C4B66BC3ee95F6D9a2E26BdF6fbfd5", 0, signature, data, eta);
                      
//                     // Increase time beyond the grace period   >=5 will revert
//                     await ethers.provider.send("evm_increaseTime", [(6*60) + 480]);
//                      await ethers.provider.send("evm_mine", []);
                      
//                         // Attempt to execute the transaction with the correct temp_sender and an outdated ETA
//                         const tx1 = await timelock.connect(admin).executeTransaction("0xF8cd1A0CC0C4B66BC3ee95F6D9a2E26BdF6fbfd5", 0, signature, data, eta);
//                       });
                                   
// });