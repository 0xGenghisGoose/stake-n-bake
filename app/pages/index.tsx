import type { NextPage } from 'next';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import { MutableRefObject, useEffect, useRef, useState } from 'react';
import {
	stakinTokenAddy,
	bakinTokenAddy,
	stakingContractAddy,
	stakinTokenABI,
	bakinTokenABI,
	stakeableABI,
} from '../constants';
import Head from 'next/head';

const Home: NextPage = () => {
	/***********************************************
	 *  STATE
	 ***********************************************/

	const [walletConnected, setWalletConnected] = useState(false);
	const [loading, setLoading] = useState(false);
	const [userStakinBalance, setUserStakinBalance] = useState<number>(0);
	const [userBakinBalance, setUserBakinBalance] = useState<number>(0);
	const [userStakedBalance, setUserStakedBalance] = useState<number>(0);
	const [stakedTotal, setStakedTotal] = useState<number>(0);
	const [mintFormInput, setMintFormInput] = useState<number | any | null>(0);
	const [stakeFormInput, setStakeFormInput] = useState<number | any | null>(0);
	const [unstakeFormInput, setUnstakeFormInput] = useState<number | any | null>(
		0
	);
	const [userAddress, setUserAddress] = useState<any | null>();
	const web3ModalRef: MutableRefObject<any> = useRef();

	/***********************************************
	 *  HELPER FUNCTIONS
	 ***********************************************/

	/**
  /// @notice Returns a web3 provider
  /// @param needSigner - Boolean - whether signer is needed or not for action
  */
	const getProviderOrSigner = async (needSigner: boolean = false) => {
		const provider = await web3ModalRef.current.connect();
		const web3Provider = new ethers.providers.Web3Provider(provider);
		const userAcct = web3Provider.getSigner();
		const userAddy = await userAcct.getAddress();
		setUserAddress(userAddy);

		const { chainId } = await web3Provider.getNetwork();
		if (chainId !== 4) {
			window.alert('Please change the network to Rinkeby');
			throw new Error('Please change the network to Rinkeby');
		}

		if (needSigner) {
			const signer = web3Provider.getSigner();
			return signer;
		}
		return web3Provider;
	};

	/**
  /// @notice Manually connects wallet, hooked to button on UI
  /// @dev If your wallet is connected but your wallet address is not showing on the page, call this function by hitting the `Connect to Wallet` option on the frontend
  */
	const connectWallet = async () => {
		try {
			await getProviderOrSigner();
			setWalletConnected(true);
		} catch (err) {
			console.error(err);
		}
	};

	/**
  /// @notice Conditional for which `Connect to Wallet` button to render on frontend
  */
	const renderButton = () => {
		if (!walletConnected) {
			return (
				<button
					className='bg-gradient-to-br from-purple-500  via-blue-500 to-black-300 hover:bg-blue-700 text-white font-bold py-2 px-12 float-right rounded-full'
					onClick={(event: React.MouseEvent<HTMLElement>) => {
						connectWallet();
					}}>
					Connect to Wallet
				</button>
			);
		} else {
			return (
				<button className='bg-gradient-to-br from-purple-500  via-blue-500 to-black-300 hover:bg-blue-700 text-white font-bold py-2 px-12 float-right rounded-full'>
					{userAddress}
				</button>
			);
		}
	};

	const onSubmit = (e: any): void => {
		e.preventDefault();
	};

	/**
  /// @notice Get all balances to display on frontend
  /// @dev Retrieves balances from onchain, then sets all of the state
  */
	const getUserBalances = async () => {
		try {
			const provider = await web3ModalRef.current.connect();
			const web3Provider = new ethers.providers.Web3Provider(provider);
			const userAcct = web3Provider.getSigner();
			const userAddy = await userAcct.getAddress();

			const stakinTokenContract = new ethers.Contract(
				stakinTokenAddy,
				stakinTokenABI,
				web3Provider
			);

			const bakinTokenContract = new ethers.Contract(
				bakinTokenAddy,
				bakinTokenABI,
				web3Provider
			);

			const stakingContract = new ethers.Contract(
				stakingContractAddy,
				stakeableABI,
				web3Provider
			);

			const userStakinTotal = Number(
				await stakinTokenContract.balanceOfAcct(userAddy)
			);

			const userBakinTotal = Number(
				await bakinTokenContract.balanceOfAcct(userAddy)
			);

			const userStakedTotal = Number(await stakingContract.balances(userAddy));
			const stakedContractTotal = Number(await stakingContract.totalSupply());

			setUserStakinBalance(userStakinTotal);
			setUserBakinBalance(userBakinTotal);
			setUserStakedBalance(userStakedTotal);
			setStakedTotal(stakedContractTotal);
		} catch (err) {
			console.error(err);
		}
	};

	/***********************************************
	 *  FUNCTIONS
	 ***********************************************/

	/**
  /// @notice Mint inputted amount of Stakin Tokens (.001 ETH per STK)
  /// @dev Please do a quick refresh if the UI did not automatically update with new balances
  */
	const mint = async (amount: number) => {
		try {
			const signer = await getProviderOrSigner(true);
			const stakingContract = Stakeable__factory.connect(
				stakingContractAddy,
				signer
			);

			const value = 0.001 * amount;

			const tx = await stakingContract.buyStakin(amount, {
				value: ethers.utils.parseEther(value.toString()),
			});
			setLoading(true);
			await tx.wait();
			setLoading(false);
			setMintFormInput(0);
			window.alert('Successfully minted Stakin Tokens');
		} catch (err) {
			console.error(err);
		}
	};

	/**
  /// @notice Stake inputted amount of Stakin Tokens in contract
  /// @dev Please do a quick refresh if the UI did not automatically update with new balances
  /// @param amount - Amount of Stakin Tokens to stake
  */
	const stake = async (amount: number) => {
		try {
			const signer = await getProviderOrSigner(true);
			const stakinTokenContract = StakinToken__factory.connect(
				stakinTokenAddy,
				signer
			);
			const stakingContract = Stakeable__factory.connect(
				stakingContractAddy,
				signer
			);

			let tx = await stakinTokenContract.approve(stakingContractAddy, amount);
			setLoading(true);
			await tx.wait();
			setLoading(false);

			const _stakeAmtWei = ethers.utils.parseEther(amount.toString());
			tx = await stakingContract.stake(_stakeAmtWei);
			setLoading(true);
			await tx.wait();
			setLoading(false);
			setStakeFormInput(0);
			window.alert('Successfully staked Stakin Tokens');
		} catch (err) {
			console.error(err);
		}
	};

	/**
  /// @notice Unstake inputted amount of Stakin Tokens from the contract
  /// @dev Please do a quick refresh if the UI did not automatically update with new balances
  /// @param amount - Amount of Stakin Tokens to unstake
  */
	const unstake = async (amount: number) => {
		try {
			const signer = await getProviderOrSigner(true);
			const stakingContract = Stakeable__factory.connect(
				stakingContractAddy,
				signer
			);

			const _unstakeAmtWei = ethers.utils.parseEther(amount.toString());

			let tx = await stakingContract.unstake(_unstakeAmtWei);
			setLoading(true);
			await tx.wait();
			setLoading(false);
			setUnstakeFormInput(0);
			window.alert('Successfully unstaked Stakin Tokens');
		} catch (err) {
			console.error(err);
		}
	};

	/**
  /// @notice Claim your Bakin Token rewards
  /// @dev Please do a quick refresh if the UI did not automatically update with new balances
  /// @param amount - Amount of Stakin Tokens to stake
  */
	const claim = async () => {
		try {
			const signer = await getProviderOrSigner(true);
			const stakingContract = Stakeable__factory.connect(
				stakingContractAddy,
				signer
			);

			let tx = await stakingContract.withdrawBakinRewards();
			setLoading(true);
			await tx.wait();
			setLoading(false);
			window.alert('Successfully claimed Bakin Tokens!');
		} catch (err) {
			console.error(err);
		}
	};

	/**
  /// @notice Updates UI with user balances & connects them to Rinkeby
  /// @dev Refreshes upon connecting / disconnecting wallet, or when screen enters loading (after every tx)
  */
	useEffect(() => {
		if (!walletConnected) {
			web3ModalRef.current = new Web3Modal({
				network: 'rinkeby',
				providerOptions: {},
				disableInjectedProvider: false,
			});
			getUserBalances();
			connectWallet();
		}
	}, [walletConnected, loading]);

	/**
  /// @notice Simple loading screen to let users know protocol is working when awaiting responses to calls to the chain & contracts
  /// @dev Sorry it sucks hehe, needed something quick & easy :)
  */
	if (loading) {
		return (
			<div className='text-center text-3xl my-16 animate-pulse bg-gradient-to-br from-purple-500 to-green-300 w-full h-full'>
				<h1 className='bg-gradient-to-br from-purple-500 to-green-300 w-full h-full'>
					LOADING... :)
				</h1>
			</div>
		);
	}

	/**
  /// @dev I chose to keep all HTML, CSS & JS in one place since it was a quick & dirty frontend, was mainly focused on the contracts; thus, the below is a bit clunky, sorry about that
  */
	return (
		<div className='text-center flex flex-col'>
			<Head>
				<title>Stake N Bake</title>
				<meta name='Stake N Bake' content='Stake N Bake' />
				<link rel='icon' href='/favicon.ico' />
			</Head>

			<nav className='w-full flex-col space-x-3 py-4 bg-black font-bold text-white drop-shadow-lg'>
				<h3 className='text-3xl pl-4 text-purple-500 float-left'>
					Stake N Bake
				</h3>
				<h3 className='pt-2.5 float-left'>
					<a
						href='https://github.com/0xGenghisGoose'
						target='_blank'
						rel='noreferrer'>
						by 0xGenghisGoose
					</a>
				</h3>
				{renderButton()}
			</nav>
			<div className='bg-gradient-to-br from-purple-500 to-green-300'>
				<header className='mx-8 my-6 py-8'>
					<h1 className='text-xl font-semibold tracking-wide'>
						STAKE YOUR STAKIN TOKENS BELOW...
					</h1>
					<br />
					<h1 className='text-xl font-semibold tracking-wide'>
						...AND RECEIVE BAKIN TOKENS AS A REWARD!
					</h1>
				</header>

				<div className='flex flex-row space-x-16 justify-center'>
					<div className='flex flex-col border-indigo-500/75 border-4 rounded-xl shadow-xl mb-4 px-4 py-4'>
						<p className='py-2'>
							If you need to{' '}
							<span className='text-blue-500 font-semibold'>mint</span> Stakin
							Tokens, please do so here
						</p>
						<br />
						<form className='py-0.5' onSubmit={onSubmit}>
							<label>Input amount to mint</label>
							<br />
							<input
								className='my-4'
								onChange={(e) => setMintFormInput(e.target.value)}
								value={mintFormInput}
							/>
							<br />
						</form>
						<button
							className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-12 mb-4 rounded-full'
							onClick={(event: React.MouseEvent<HTMLElement>) => {
								mint(mintFormInput);
							}}>
							MINT
						</button>
						<br />
						{`Current balance: ${ethers.utils.formatUnits(
							userStakinBalance.toString(),
							18
						)} STK`}
					</div>
					<div className='flex flex-col border-indigo-500/75 border-4 rounded-xl shadow-xl mb-4 px-4 py-4'>
						<p className='py-2'>
							If you are looking to{' '}
							<span className='text-green-500 font-semibold'>stake</span> or{' '}
							<span className='text-red-500 font-semibold'>unstake</span>,
							please do so here
						</p>
						<form className='py-2 mt-4' onSubmit={onSubmit}>
							<label>Amount of Stakin Tokens to stake</label>
							<br />
							<input
								className='my-4'
								onChange={(e) => setStakeFormInput(e.target.value)}
								value={stakeFormInput}
							/>
							<br />
						</form>
						<button
							className='bg-green-500 hover:bg-blue-700 text-white font-bold py-4 px-12 mb-4 rounded-full'
							onClick={(event: React.MouseEvent<HTMLElement>) => {
								stake(stakeFormInput);
							}}>
							STAKE
						</button>
						<br />
						{`Current total staked: ${ethers.utils.formatUnits(
							stakedTotal.toString(),
							18
						)} STK`}
						<form className='py-2 mt-4' onSubmit={onSubmit}>
							<label>Amount of Stakin Tokens to unstake</label>
							<br />
							<input
								className='my-4'
								onChange={(e) => setUnstakeFormInput(e.target.value)}
								value={unstakeFormInput}
							/>
							<br />
						</form>
						<button
							className='bg-red-500 hover:bg-blue-700 text-white font-bold py-4 mb-4 px-12 rounded-full'
							onClick={(event: React.MouseEvent<HTMLElement>) => {
								unstake(unstakeFormInput);
							}}>
							UNSTAKE
						</button>
						<br />
						{`Current amount staked: ${ethers.utils.formatUnits(
							userStakedBalance.toString(),
							18
						)} STK`}
					</div>
					<div className='flex flex-col border-indigo-500/75 border-4 rounded-xl shadow-xl mb-4 px-4 py-4'>
						<p className='py-2 mb-4'>
							<span className='text-purple-500 font-semibold'>Claim</span> your
							Bakin Token rewards below!
						</p>
						<button
							className='bg-purple-500 hover:bg-blue-700 text-white font-bold py-4 mt-24 mb-4 px-12 rounded-full'
							onClick={(event: React.MouseEvent<HTMLElement>) => {
								claim();
							}}>
							BAKE BABY BAKE
						</button>
						<br />
						{`Current balance: ${ethers.utils.formatUnits(
							userBakinBalance.toString(),
							18
						)} BKT`}
					</div>
				</div>
				<footer className='bg-red-500 text-white font-bold py-6 overflow-hidden mb-0 mt-24'>
					<p className='mb-0'>
						Disclaimer: These contracts were made for fun & educational purposes
						only & have not been audited or reviewed. Please use at own risk,
						author is not responsible for lost funds.
					</p>
				</footer>
			</div>
		</div>
	);
};

export default Home;
