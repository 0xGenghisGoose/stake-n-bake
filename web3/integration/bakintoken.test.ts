// const { expect } = require('chai');
// const { ethers } = require('hardhat');

// let addy1;
// let addy2;

// let stakinContract;
// let deployedStakinContract;
// let bakinContract;
// let deployedBakinContract;
// let stakeable;
// let deployedStakeable;

// describe('BakinToken', () => {
// 	beforeEach(async () => {
// 		[addy1, addy2] = await ethers.getSigners();
// 		stakinContract = await ethers.getContractFactory('StakinToken');
// 		deployedStakinContract = await stakinContract.deploy(100); // had initial supply for testing purposes
// 		await deployedStakinContract.deployed();

// 		bakinContract = await ethers.getContractFactory('BakinToken');
// 		deployedBakinContract = await bakinContract.deploy();
// 		await deployedBakinContract.deployed();

// 		stakeable = await ethers.getContractFactory('Stakeable');
// 		deployedStakeable = await stakeable.deploy(
// 			deployedStakinContract.address,
// 			deployedBakinContract.address
// 		);
// 		await deployedStakeable.deployed();
// 	});

// 	it('Should be able to be claimed and return correct user balance', async () => {
// 		const bakinRewards = await deployedStakeable.withdrawBakinRewards(
// 			addy1.address
// 		);
// 		await bakinRewards.wait();
// 		const userBakinBalance = await deployedBakinContract.balanceOf(
// 			addy1.address
// 		);
// 		expect(userBakinBalance).to.equal(5);
// 	});

// 	it('Should be tradeable and return correct total supply after txns', async () => {
// 		const bakinRewards = await deployedStakeable.withdrawBakinRewards(
// 			addy1.address
// 		);
// 		await bakinRewards.wait();

// 		const tradeTxn = await deployedBakinContract.transferFrom(
// 			addy1.address,
// 			addy2.address,
// 			1
// 		);
// 		await tradeTxn.wait();

// 		const user1Balance = await deployedBakinContract.balanceOfAcct(
// 			addy1.address
// 		);
// 		const user2Balance = await deployedBakinContract.balanceOfAcct(
// 			addy2.address
// 		);
// 		const totalBakinSupply = await deployedBakinContract.totalSupply();
// 		console.log(totalBakinSupply);
// 		expect(user1Balance).to.equal(4);
// 		expect(user2Balance).to.equal(1);
// 		expect(totalBakinSupply).to.equal(5);
// 	});
// });
