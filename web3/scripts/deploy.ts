import { run, ethers } from 'hardhat';

async function deploy() {
	await run('compile');

	const stakinContract = await ethers.getContractFactory('StakinToken');
	const deployedStakin = await stakinContract.deploy();
	await deployedStakin.deployed();
	console.log('Stakin Token Address: ', deployedStakin.address);

	const bakinContract = await ethers.getContractFactory('BakinToken');
	const deployedBakin = await bakinContract.deploy();
	await deployedBakin.deployed();
	console.log('Bakin Token Address: ', deployedBakin.address);

	const stakeableContract = await ethers.getContractFactory('Stakeable');
	const deployedStakeable = await stakeableContract.deploy(
		deployedStakin.address,
		deployedBakin.address
	);
	await deployedStakeable.deployed();
	console.log('Stakeable Contract Address: ', deployedStakeable.address);
}

(async () => {
	try {
		await deploy();
		process.exit(0);
	} catch (error) {
		console.error(error);
		process.exit(1);
	}
})();
