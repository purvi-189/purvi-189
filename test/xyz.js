
   
//   ///---------------queue------------------------------------------------
//     // waiting for 1 block to pass before voting 
//     await ethers.provider.send("evm_mine");

//     //-------------------  voting start
//     const currentTime = (await ethers.provider.getBlock("latest")).timestamp;
//     const futureTime = currentTime + 600;
//     await ethers.provider.send("evm_setNextBlockTimestamp", [futureTime]);
//     await ethers.provider.send("evm_mine");

//     try {    
//           await samhita.connect(voter1).castVote(proposalId, true);
//           await samhita.connect(voter2).castVote(proposalId, true);
//           await samhita.connect(voter3).castVote(proposalId, true);
//           await samhita.connect(voter4).castVote(proposalId, false);
//           const forVotes_ = (await samhita.proposals(proposalId)).forVotes.toNumber();
//           console.log(forVotes_);
    
//         console.log("voting done");        
//            // 40 blocks
//       for (let i = 0; i < 40; i++) {
//         await ethers.provider.send("evm_mine");
//       }

//       const p = await samhita.state(proposalId);
//       console.log("succeeded: ",p);
//       await samhita.queue(proposalId);

//       const q = await samhita.state(proposalId);
//       console.log("queue: ",q);

//       await tx.wait();

//       const finall = await ethers.provider.getBalance(proposer.address);
//       console.log("RETURN: ",finall);
  

//         }

//         
  
//     ///-------END-----
//     });



//     it("should not be queued if not succeeded", async function(){
//         const tokenPrice = await token.getTokenPrice();
    
//         await expect(
//           samhita.connect(proposer).addMember(10, {
//             value: ethers.utils.parseEther(String((10 * tokenPrice) / 10 ** 18)),
//           })
//         ).to.be.revertedWith("Contract does not have enough samhitaTokens");
    
//         // transfer tokens to the contract
//         const tx = await token
//           .connect(admin)
//           .transfer(samhita.address, "100000000000000000000");
//         await tx.wait();
    
      
//         await samhita.connect(proposer).addMember(20, {
//           value: ethers.utils.parseEther(String((20 * tokenPrice) / 10 ** 18))}
//           );
    
//         await samhita.connect(voter1).addMember(15, {
//           value: ethers.utils.parseEther(String((15 * tokenPrice) / 10 ** 18)),
//         });
//         await token.writeCheckpoint(voter1.address, 0, 0, 15 ) ;
    
//         await samhita.connect(voter2).addMember(20, {
//           value: ethers.utils.parseEther(String((20 * tokenPrice) / 10 ** 18)),
//         });
//         await token.writeCheckpoint(voter2.address, 0, 0, 20 ) ;
    
      
//         expect(await samhita.isMemberAdded(proposer.address)).to.equal(true);
//         expect(await samhita.isMemberAdded(voter1.address)).to.equal(true);
//         expect(await samhita.isMemberAdded(voter2.address)).to.equal(true);
     
    
//         // ---------create a proposal ------------------------------------------------------------------------------------
//         const stakeAmount = await samhita.proposalStake();
//         // approve tokens
//         await token.connect(proposer).approve(samhita.address, stakeAmount);
    
//         // delegate votes
//         await token.delegate(proposer.address);
    
//         const transx = await samhita
//           .connect(proposer)
//           .propose(
//             ["0x683E7C7cD4DD8a93D921Efe53E075b21cd58D271"],
//             [0],
//             ["execute(uint)"],
//             [ethers.utils.defaultAbiCoder.encode(["uint256"], [42])],
//             "Proposal of samhita DAO",
//             "template",
//             "bafybeifrwhe5h22blc33rgvcktxe3wedjq467caia23ce7toal4tym2doy",
//             { value: stakeAmount }
//           );
//         const receipt = await transx.wait();
    

//         const proposalId =  (await samhita.proposals(1)).id.toNumber() ;
//         ///---------------queue------------------------------------------------
//           // waiting for 1 block to pass before voting 
//           await ethers.provider.send("evm_mine");
      
//           //-------------------  voting start
//           const currentTime = (await ethers.provider.getBlock("latest")).timestamp;
//           const futureTime = currentTime + 600;
//           await ethers.provider.send("evm_setNextBlockTimestamp", [futureTime]);
//           await ethers.provider.send("evm_mine");

//           try {    
//                 await samhita.connect(voter1).castVote(proposalId, true);
//                 await samhita.connect(voter2).castVote(proposalId, true);

//                    // 40 blocks
//                    for (let i = 0; i < 40; i++) {
//                     await ethers.provider.send("evm_mine");
//                   }
//                 console.log("voting done");        
        
//            const state = await samhita.state(proposalId);

//            console.log("Defeated as voting not achieved: ",state);
//            await expect(samhita.connect(admin).queue(proposalId)).to.be.revertedWith("proposal can only be queued if it is succeeded");
//           }
//             catch(error) {
//               console.error("An error occurred during voting:", error);
//             }  
//           });


//       it("should not allow to vote after voting is closed", async function(){
//             const tokenPrice = await token.getTokenPrice();
    
//             await expect(
//               samhita.connect(proposer).addMember(10, {
//                 value: ethers.utils.parseEther(String((10 * tokenPrice) / 10 ** 18)),
//               })
//             ).to.be.revertedWith("Contract does not have enough samhitaTokens");
        
//             // transfer tokens to the contract
//             const tx = await token
//               .connect(admin)
//               .transfer(samhita.address, "100000000000000000000");
//             await tx.wait();
        
          
//             await samhita.connect(proposer).addMember(20, {
//               value: ethers.utils.parseEther(String((20 * tokenPrice) / 10 ** 18))}
//               );
        
//             await samhita.connect(voter1).addMember(15, {
//               value: ethers.utils.parseEther(String((15 * tokenPrice) / 10 ** 18)),
//             });
//             await token.writeCheckpoint(voter1.address, 0, 0, 15 ) ;
        
//             await samhita.connect(voter2).addMember(20, {
//               value: ethers.utils.parseEther(String((20 * tokenPrice) / 10 ** 18)),
//             });
//             await token.writeCheckpoint(voter2.address, 0, 0, 20 ) ;
        
          
//             expect(await samhita.isMemberAdded(proposer.address)).to.equal(true);
//             expect(await samhita.isMemberAdded(voter1.address)).to.equal(true);
//             expect(await samhita.isMemberAdded(voter2.address)).to.equal(true);
         
        
//             // ---------create a proposal ------------------------------------------------------------------------------------
//             const stakeAmount = await samhita.proposalStake();
//             // approve tokens
//             await token.connect(proposer).approve(samhita.address, stakeAmount);
        
//             // delegate votes
//             await token.delegate(proposer.address);
        
//             const transx = await samhita
//               .connect(proposer)
//               .propose(
//                 ["0x683E7C7cD4DD8a93D921Efe53E075b21cd58D271"],
//                 [0],
//                 ["execute(uint)"],
//                 [ethers.utils.defaultAbiCoder.encode(["uint256"], [42])],
//                 "Proposal of samhita DAO",
//                 "template",
//                 "bafybeifrwhe5h22blc33rgvcktxe3wedjq467caia23ce7toal4tym2doy",
//                 { value: stakeAmount }
//               );
//             const receipt = await transx.wait();
//             const proposalId =  (await samhita.proposals(1)).id.toNumber() ;
//             ///---------------queue------------------------------------------------
//               // waiting for 1 block to pass before voting 
//               await ethers.provider.send("evm_mine");
          
//               //-------------------  voting start
//               const currentTime = (await ethers.provider.getBlock("latest")).timestamp;
//               const futureTime = currentTime + 600;
//               await ethers.provider.send("evm_setNextBlockTimestamp", [futureTime]);
//               await ethers.provider.send("evm_mine");
    
//                  // 40 blocks
//                  for (let i = 0; i < 40; i++) {
//                   await ethers.provider.send("evm_mine");
//                 }
//                 // voting time ended

//                 await expect(samhita.connect(voter1).castVote(proposalId, true)).to.be.revertedWith("voting is closed");
//               });


//               it("should revert if the voter has already voted", async function(){

//                 const tokenPrice = await token.getTokenPrice();
    
//                 await expect(
//                   samhita.connect(proposer).addMember(10, {
//                     value: ethers.utils.parseEther(String((10 * tokenPrice) / 10 ** 18)),
//                   })
//                 ).to.be.revertedWith("Contract does not have enough samhitaTokens");
            
//                 // transfer tokens to the contract
//                 const tx = await token
//                   .connect(admin)
//                   .transfer(samhita.address, "100000000000000000000");
//                 await tx.wait();
            
              
//                 await samhita.connect(proposer).addMember(20, {
//                   value: ethers.utils.parseEther(String((20 * tokenPrice) / 10 ** 18))}
//                   );
            
//                 await samhita.connect(voter1).addMember(15, {
//                   value: ethers.utils.parseEther(String((15 * tokenPrice) / 10 ** 18)),
//                 });
//                 await token.writeCheckpoint(voter1.address, 0, 0, 15 ) ;
            
//                 await samhita.connect(voter2).addMember(20, {
//                   value: ethers.utils.parseEther(String((20 * tokenPrice) / 10 ** 18)),
//                 });
//                 await token.writeCheckpoint(voter2.address, 0, 0, 20 ) ;
            
              
//                 expect(await samhita.isMemberAdded(proposer.address)).to.equal(true);
//                 expect(await samhita.isMemberAdded(voter1.address)).to.equal(true);
//                 expect(await samhita.isMemberAdded(voter2.address)).to.equal(true);
             
            
//                 // ---------create a proposal ------------------------------------------------------------------------------------
//                 const stakeAmount = await samhita.proposalStake();
//                 // approve tokens
//                 await token.connect(proposer).approve(samhita.address, stakeAmount);
            
//                 // delegate votes
//                 await token.delegate(proposer.address);
            
//                 const transx = await samhita
//                   .connect(proposer)
//                   .propose(
//                     ["0x683E7C7cD4DD8a93D921Efe53E075b21cd58D271"],
//                     [0],
//                     ["execute(uint)"],
//                     [ethers.utils.defaultAbiCoder.encode(["uint256"], [42])],
//                     "Proposal of samhita DAO",
//                     "template",
//                     "bafybeifrwhe5h22blc33rgvcktxe3wedjq467caia23ce7toal4tym2doy",
//                     { value: stakeAmount }
//                   );
//                 const receipt = await transx.wait();
            
        
//                 const proposalId =  (await samhita.proposals(1)).id.toNumber() ;
//                 ///---------------queue------------------------------------------------
//                   // waiting for 1 block to pass before voting 
//                   await ethers.provider.send("evm_mine");
              
//                   //-------------------  voting start
//                   const currentTime = (await ethers.provider.getBlock("latest")).timestamp;
//                   const futureTime = currentTime + 600;
//                   await ethers.provider.send("evm_setNextBlockTimestamp", [futureTime]);
//                   await ethers.provider.send("evm_mine");
        
//                   try {    
//                         await samhita.connect(voter1).castVote(proposalId, true);
//                         await samhita.connect(voter2).castVote(proposalId, true);
//                         await expect(samhita.connect(voter1).castVote(proposalId, true)).to.be.revertedWith("voter has already voted");

//                            // 40 blocks
//                            for (let i = 0; i < 40; i++) {
//                             await ethers.provider.send("evm_mine");
//                           }
//                       }
//                     catch(error) {
//                       console.error("An error occurred during voting:", error);
//                     }
//               });


//           it("should not execute a proposal if in non-queued state", async function (){
//             const tokenPrice = await token.getTokenPrice();
    
//         await expect(
//           samhita.connect(proposer).addMember(10, {
//             value: ethers.utils.parseEther(String((10 * tokenPrice) / 10 ** 18)),
//           })
//         ).to.be.revertedWith("Contract does not have enough samhitaTokens");
    
//         // transfer tokens to the contract
//         const tx = await token
//           .connect(admin)
//           .transfer(samhita.address, "100000000000000000000");
//         await tx.wait();
    
      
//         await samhita.connect(proposer).addMember(20, {
//           value: ethers.utils.parseEther(String((20 * tokenPrice) / 10 ** 18))}
//           );
    
//         await samhita.connect(voter1).addMember(15, {
//           value: ethers.utils.parseEther(String((15 * tokenPrice) / 10 ** 18)),
//         });
//         await token.writeCheckpoint(voter1.address, 0, 0, 15 ) ;
    
//         await samhita.connect(voter2).addMember(20, {
//           value: ethers.utils.parseEther(String((20 * tokenPrice) / 10 ** 18)),
//         });
//         await token.writeCheckpoint(voter2.address, 0, 0, 20 ) ;
    
      
//         expect(await samhita.isMemberAdded(proposer.address)).to.equal(true);
//         expect(await samhita.isMemberAdded(voter1.address)).to.equal(true);
//         expect(await samhita.isMemberAdded(voter2.address)).to.equal(true);
     
    
//         // ---------create a proposal ------------------------------------------------------------------------------------
//         const stakeAmount = await samhita.proposalStake();
//         // approve tokens
//         await token.connect(proposer).approve(samhita.address, stakeAmount);
    
//         // delegate votes
//         await token.delegate(proposer.address);
    
//         const transx = await samhita
//           .connect(proposer)
//           .propose(
//             ["0x683E7C7cD4DD8a93D921Efe53E075b21cd58D271"],
//             [0],
//             ["execute(uint)"],
//             [ethers.utils.defaultAbiCoder.encode(["uint256"], [42])],
//             "Proposal of samhita DAO",
//             "template",
//             "bafybeifrwhe5h22blc33rgvcktxe3wedjq467caia23ce7toal4tym2doy",
//             { value: stakeAmount }
//           );
//         const receipt = await transx.wait();
//         const proposalId =  (await samhita.proposals(1)).id.toNumber() ;
//         ///---------------queue------------------------------------------------
//           // waiting for 1 block to pass before voting 
//           await ethers.provider.send("evm_mine");
      
//           //-------------------  voting start
//           const currentTime = (await ethers.provider.getBlock("latest")).timestamp;
//           const futureTime = currentTime + 600;
//           await ethers.provider.send("evm_setNextBlockTimestamp", [futureTime]);
//           await ethers.provider.send("evm_mine");

//           try {    
//                 await samhita.connect(voter1).castVote(proposalId, true);
//                 await samhita.connect(voter2).castVote(proposalId, true);

//                    // 40 blocks
//                    for (let i = 0; i < 40; i++) {
//                     await ethers.provider.send("evm_mine");
//                   }
//                 console.log("voting done");       
//            const state = await samhita.state(proposalId);
//            console.log("Defeated as voting not achieved: ",state);
//            await expect(samhita.connect(admin).execute(proposalId)).to.be.revertedWith("proposal can only be executed if it is queued");
//           }
//             catch(error) {
//               console.error("An error occurred during voting:", error);
//             }  
//           });


//         it("can't be canceled if gained enough votes", async function(){
//           const tokenPrice = await token.getTokenPrice();

//     const initialContractBalance = await ethers.provider.getBalance(samhita.address);
//     console.log("----- init b: ",initialContractBalance);

//     await expect(
//       samhita.connect(proposer).addMember(10, {
//         value: ethers.utils.parseEther(String((10 * tokenPrice) / 10 ** 18)),
//       })
//     ).to.be.revertedWith("Contract does not have enough samhitaTokens");

//     // transfer tokens to the contract  -- 100 
//     const tx = await token
//       .connect(admin)
//       .transfer(samhita.address, "100000000000000000000");

//     await tx.wait();

//     await expect(
//       samhita.connect(proposer).addMember(6, {
//         value: ethers.utils.parseEther(String(6 * (tokenPrice / 10 ** 18))),
//       })
//     ).to.be.revertedWith(
//       "You must purchase at least 10 tokens to become a member"
//     );
//     await samhita.connect(proposer).addMember(20, {
//       value: ethers.utils.parseEther(String((20 * tokenPrice) / 10 ** 18))}
//       );

  
//       console.log("--->>>prop bal: ", await token.balanceOf(proposer.address));

//     await samhita.connect(voter1).addMember(15, {
//       value: ethers.utils.parseEther(String((15 * tokenPrice) / 10 ** 18)),
//     });
//     await token.writeCheckpoint(voter1.address, 0, 0, 15 ) ;

//     await samhita.connect(voter2).addMember(20, {
//       value: ethers.utils.parseEther(String((20 * tokenPrice) / 10 ** 18)),
//     });
//     await token.writeCheckpoint(voter2.address, 0, 0, 20 ) ;

//     await samhita.connect(voter3).addMember(17, {
//       value: ethers.utils.parseEther(String((17 * tokenPrice) / 10 ** 18)),
//     });
//     await token.writeCheckpoint(voter3.address, 0, 0, 17 ) ;


//     await samhita.connect(voter4).addMember(22, {
//       value: ethers.utils.parseEther(String((22 * tokenPrice) / 10 ** 18)),
//     });
//     await token.writeCheckpoint(voter4.address, 0, 0, 22);

  
//     expect(await token.balanceOf(proposer.address)).to.equal(
//       "20000000000000000000"
//     );
//     expect(await token.balanceOf(voter1.address)).to.equal(
//       "15000000000000000000"
//     );
//     expect(await token.balanceOf(voter2.address)).to.equal(
//       "20000000000000000000"
//     );
//     expect(await token.balanceOf(voter3.address)).to.equal(
//       "17000000000000000000"
//     );
//     expect(await token.balanceOf(voter4.address)).to.equal(
//       "22000000000000000000"
//     );
 
//     expect(await samhita.isMemberAdded(proposer.address)).to.equal(true);
//     expect(await samhita.isMemberAdded(voter1.address)).to.equal(true);
//     expect(await samhita.isMemberAdded(voter2.address)).to.equal(true);
//     expect(await samhita.isMemberAdded(voter3.address)).to.equal(true);
//     expect(await samhita.isMemberAdded(voter4.address)).to.equal(true);
//     expect(await samhita.isMemberAdded(voter5.address)).to.equal(false);

//     await expect(samhita.addMember(20)).to.be.revertedWith("Not enough value");

//     const final = await ethers.provider.getBalance(samhita.address);
//     console.log("----- final c b: ",final);


//     // create a proposal ------------------------------------------------------------------------------------
//     const stakeAmount = await samhita.proposalStake();
//     // approve tokens
//     await token.connect(proposer).approve(samhita.address, stakeAmount);

//     // check condition for the threshold
//     await expect(
//       samhita
//         .connect(proposer)
//         .propose(
//           ["0x683E7C7cD4DD8a93D921Efe53E075b21cd58D271"],
//           [0],
//           ["execute(uint)"],
//           [ethers.utils.defaultAbiCoder.encode(["uint256"], [42])],
//           "Proposal of samhita DAO",
//           "template",
//           "bafybeifrwhe5h22blc33rgvcktxe3wedjq467caia23ce7toal4tym2doy",
//           { value: stakeAmount }
//         )
//     ).to.be.revertedWith("proposer votes below proposal threshold");

//     // delegate votes
//     await token.delegate(proposer.address);

//     const transx = await samhita
//       .connect(proposer)
//       .propose(
//         ["0x683E7C7cD4DD8a93D921Efe53E075b21cd58D271"],
//         [0],
//         ["execute(uint)"],
//         [ethers.utils.defaultAbiCoder.encode(["uint256"], [42])],
//         "Proposal of samhita DAO",
//         "template",
//         "bafybeifrwhe5h22blc33rgvcktxe3wedjq467caia23ce7toal4tym2doy",
//         { value: stakeAmount }
//       );

//   // queue a proposal ------------------------------------------------------------------------------------
//     const proposal = await samhita.proposals(1);
//     const proposalId =  (await samhita.proposals(1)).id.toNumber() ;
//     console.log("proposal ID: ", proposalId);
  
//     console.log("state after creating prop- Active-->: ", await samhita.state(proposal.id));

//   ///---------------queue------------------------------------------------
//     // waiting for 1 block to pass before voting 
//     await ethers.provider.send("evm_mine");

//     //-------------------  voting start
//     const currentTime = (await ethers.provider.getBlock("latest")).timestamp;
//     const futureTime = currentTime + 600;
//     await ethers.provider.send("evm_setNextBlockTimestamp", [futureTime]);
//     await ethers.provider.send("evm_mine");

//     try {    
//           await samhita.connect(voter1).castVote(proposalId, true);
//           await samhita.connect(voter2).castVote(proposalId, true);
//           await samhita.connect(voter3).castVote(proposalId, true);
//           await samhita.connect(voter4).castVote(proposalId, false);
//           const forVotes_ = (await samhita.proposals(proposalId)).forVotes.toNumber();
//           console.log(forVotes_);
    
//         console.log("voting done");        
//            // 40 blocks
//       for (let i = 0; i < 40; i++) {
//         await ethers.provider.send("evm_mine");
//       }

//       const p = await samhita.state(proposalId);
//       console.log("succeeded: ",p);
//       await samhita.queue(proposalId);

//       const ps = await samhita.state(proposalId);

//       const proposal = await samhita.proposals(proposalId);
//       const eta = proposal.eta.toNumber();

//       // Increase the current time to surpass the eta
//       await ethers.provider.send("evm_setNextBlockTimestamp", [eta + 1]); // Adding 1 second to ensure it's in the future
//       await ethers.provider.send("evm_mine");

//       await expect(samhita.connect(proposer).cancel(proposalId)).to.be.revertedWith("proposer above threshold");

//       const ps1 = await samhita.state(proposalId);
//       console.log("As votes above threshold cant be canceled..so state is: " + ps1);
//     }
//       catch (error) {
//         console.error("An error occurred during voting:", error);
//       }

//         });

//         it("should execute a proposal if queued", async function(){
//           const tokenPrice = await token.getTokenPrice();

//     const initialContractBalance = await ethers.provider.getBalance(samhita.address);
//     console.log("----- init b: ",initialContractBalance);

  
//     // transfer tokens to the contract  -- 100 
//     const tx = await token
//       .connect(admin)
//       .transfer(samhita.address, "100000000000000000000");

//     await tx.wait();

//     await samhita.connect(proposer).addMember(20, {
//       value: ethers.utils.parseEther(String((20 * tokenPrice) / 10 ** 18))}
//       );

  
//       console.log("--->>>prop bal: ", await token.balanceOf(proposer.address));

//     await samhita.connect(voter1).addMember(15, {
//       value: ethers.utils.parseEther(String((15 * tokenPrice) / 10 ** 18)),
//     });
//     await token.writeCheckpoint(voter1.address, 0, 0, 15 ) ;

//     await samhita.connect(voter2).addMember(20, {
//       value: ethers.utils.parseEther(String((20 * tokenPrice) / 10 ** 18)),
//     });
//     await token.writeCheckpoint(voter2.address, 0, 0, 20 ) ;

//     await samhita.connect(voter3).addMember(17, {
//       value: ethers.utils.parseEther(String((17 * tokenPrice) / 10 ** 18)),
//     });
//     await token.writeCheckpoint(voter3.address, 0, 0, 17 ) ;


//     await samhita.connect(voter4).addMember(22, {
//       value: ethers.utils.parseEther(String((22 * tokenPrice) / 10 ** 18)),
//     });
//     await token.writeCheckpoint(voter4.address, 0, 0, 22);

  
//     expect(await token.balanceOf(proposer.address)).to.equal(
//       "20000000000000000000"
//     );
//     expect(await token.balanceOf(voter1.address)).to.equal(
//       "15000000000000000000"
//     );
//     expect(await token.balanceOf(voter2.address)).to.equal(
//       "20000000000000000000"
//     );
//     expect(await token.balanceOf(voter3.address)).to.equal(
//       "17000000000000000000"
//     );
//     expect(await token.balanceOf(voter4.address)).to.equal(
//       "22000000000000000000"
//     );
 
//     expect(await samhita.isMemberAdded(proposer.address)).to.equal(true);
//     expect(await samhita.isMemberAdded(voter1.address)).to.equal(true);
//     expect(await samhita.isMemberAdded(voter2.address)).to.equal(true);
//     expect(await samhita.isMemberAdded(voter3.address)).to.equal(true);
//     expect(await samhita.isMemberAdded(voter4.address)).to.equal(true);
//     expect(await samhita.isMemberAdded(voter5.address)).to.equal(false);

//     await expect(samhita.addMember(20)).to.be.revertedWith("Not enough value");

//     const final = await ethers.provider.getBalance(samhita.address);
//     console.log("----- final c b: ",final);
//     // create a proposal ------------------------------------------------------------------------------------
//     const stakeAmount = await samhita.proposalStake();
//     // approve tokens
//     await token.connect(proposer).approve(samhita.address, stakeAmount);

//     // check condition for the threshold
//     await expect(
//       samhita
//         .connect(proposer)
//         .propose(
//           ["0x683E7C7cD4DD8a93D921Efe53E075b21cd58D271"],
//           [0],
//           ["execute(uint)"],
//           [ethers.utils.defaultAbiCoder.encode(["uint256"], [42])],
//           "Proposal of samhita DAO",
//           "template",
//           "bafybeifrwhe5h22blc33rgvcktxe3wedjq467caia23ce7toal4tym2doy",
//           { value: stakeAmount }
//         )
//     ).to.be.revertedWith("proposer votes below proposal threshold");

//     // delegate votes
//     await token.delegate(proposer.address);

//     const transx = await samhita
//       .connect(proposer)
//       .propose(
//         ["0x683E7C7cD4DD8a93D921Efe53E075b21cd58D271"],
//         [0],
//         ["execute(uint)"],
//         [ethers.utils.defaultAbiCoder.encode(["uint256"], [42])],
//         "Proposal of samhita DAO",
//         "template",
//         "bafybeifrwhe5h22blc33rgvcktxe3wedjq467caia23ce7toal4tym2doy",
//         { value: stakeAmount }
//       );

//   // queue a proposal ------------------------------------------------------------------------------------
//     const proposal = await samhita.proposals(1);
//     const proposalId =  (await samhita.proposals(1)).id.toNumber() ;
//     console.log("proposal ID: ", proposalId);
    
//   ///---------------queue------------------------------------------------
//     // waiting for 1 block to pass before voting 
//     await ethers.provider.send("evm_mine");
//     console.log("state after creating prop- Active-->: ", await samhita.state(proposal.id));

//     //-------------------  voting start
//     const currentTime = (await ethers.provider.getBlock("latest")).timestamp;
//     const futureTime = currentTime + 600;
//     await ethers.provider.send("evm_setNextBlockTimestamp", [futureTime]);
//     await ethers.provider.send("evm_mine");

//     console.log("active state before voting-->:",await samhita.state(proposalId) );

//     try {    
//           await samhita.connect(voter1).castVote(proposalId, true);
//           await samhita.connect(voter2).castVote(proposalId, true);
//           await samhita.connect(voter3).castVote(proposalId, true);
//           await samhita.connect(voter4).castVote(proposalId, false);
//           const forVotes_ = (await samhita.proposals(proposalId)).forVotes.toNumber();
//           console.log(forVotes_);
    
//         console.log("voting done");        
//            // 40 blocks
//       for (let i = 0; i < 40; i++) {
//         await ethers.provider.send("evm_mine");
//       }

//       const p = await samhita.state(proposalId);
//       console.log("succeeded: ",p);
//       await samhita.queue(proposalId);

//       console.log("--> proposal Queued");

//       const ps = await samhita.state(proposalId);
//       console.log("State after queuing: " + ps);

//       const proposal = await samhita.proposals(proposalId);
//       const eta = proposal.eta.toNumber();

//       // Increase the current time to surpass the eta
//       await ethers.provider.send("evm_setNextBlockTimestamp", [eta + 1]); // Adding 1 second to ensure it's in the future
//       await ethers.provider.send("evm_mine");

//       //----------- Execute the proposal
//       await samhita.connect(proposer).execute(proposalId);
//       await tx.wait();

//       console.log("Executed...!!");

//       const ps1 = await samhita.state(proposalId);
//       console.log("State after executing: " + ps1);
//     }

//     catch (error) {
//       console.error("An error occurred during voting:", error);
//     }

//         });



          

              




//       // -----------dont go below this-----------------
    
//     });