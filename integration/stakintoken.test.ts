const { expect } = require('chai');
const { ethers } = require('hardhat');

let addy1;
let addy2;

let stakinContract;
let deployedStakinContract;
let bakinContract;
let deployedBakinContract;
let stakeable;
let deployedStakeable;

describe('StakinToken', () => {
	beforeEach(async () => {
		[addy1, addy2] = await ethers.getSigners();
		stakinContract = await ethers.getContractFactory('StakinToken');
		deployedStakinContract = await stakinContract.deploy(100); // had initial supply for testing purposes
		await deployedStakinContract.deployed();

		bakinContract = await ethers.getContractFactory('BakinToken');
		deployedBakinContract = await bakinContract.deploy();
		await deployedBakinContract.deployed();

		stakeable = await ethers.getContractFactory('Stakeable');
		deployedStakeable = await stakeable.deploy(
			deployedStakinContract.address,
			deployedBakinContract.address
		);
		await deployedStakeable.deployed();
	});

	it('Should return the initial supply', async () => {
		const initialSupply = await deployedStakinContract.initialSupply();
		expect(initialSupply).to.equal(100);
	});

	it('Should be able to be staked & return correct balance', async () => {
		const balance = await deployedStakinContract.balanceOfAcct(addy1.address);
		const stakeTxn = await deployedStakeable.stake(addy1.address, balance);
		await stakeTxn.wait();
		const userStakes = await deployedStakeable.balanceOfAcct(addy1.address);
		expect(balance).to.equal(userStakes);
	});

	it('Should be able to be unstaked & return correct balance', async () => {
		const userBalance = await deployedStakeable.balanceOfAcct(addy1.address);
		const unstakeTxn = await deployedStakeable.unstake(
			addy1.address,
			userBalance
		);
		await unstakeTxn.wait();
		const userUnstaked = await deployedStakeable.balanceOfAcct(addy1.address);
		expect(userBalance).to.equal(userUnstaked);
	});

	it('Should be tradeable', async () => {
		const tradeTxn = await deployedStakinContract.transferFrom(
			addy1.address,
			addy2.address,
			10
		);
		await tradeTxn.wait();
		const user2Balance = await deployedStakinContract.balanceOfAcct(
			addy2.address
		);
		expect(user2Balance).to.equal(10);
	});

	it('Should return the correct total supply after txns', async () => {
		const totalSupply = await deployedStakinContract.totalSupply();
		expect(totalSupply).to.equal(100);
	});
});
