import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import * as toml from 'toml';
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-etherscan';
import 'hardhat-gas-reporter';
import 'solidity-coverage';
import { HardhatUserConfig, subtask } from 'hardhat/config';
import { TASK_COMPILE_SOLIDITY_GET_SOURCE_PATHS } from 'hardhat/builtin-tasks/task-names';
dotenv.config();

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || '1'.repeat(32);
const RINKEBY_PRIVATE_KEY = process.env.RINKEBY_PRIVATE_KEY || '1'.repeat(64);
const SOLC_DEFAULT = '0.8.10';

let foundry: any;
try {
	foundry = toml.parse(readFileSync('./foundry.toml').toString());
	foundry.default.solc = foundry.default['solc-version']
		? foundry.default['solc-version']
		: SOLC_DEFAULT;
} catch (error) {
	foundry = {
		default: {
			solc: SOLC_DEFAULT,
		},
	};
}

subtask(TASK_COMPILE_SOLIDITY_GET_SOURCE_PATHS).setAction(
	async (_, __, runSuper) => {
		const paths = await runSuper();
		return paths.filter((p: string) => !p.endsWith('.t.sol'));
	}
);

const config: HardhatUserConfig = {
	paths: {
		cache: 'cache-hardhat',
		sources: './src',
		tests: './integration',
	},
	defaultNetwork: 'hardhat',
	networks: {
		hardhat: { chainId: 1337 },
		rinkeby: {
			url: ALCHEMY_API_KEY,
			accounts: [RINKEBY_PRIVATE_KEY],
		},
	},
	solidity: {
		version: foundry.default?.solc || SOLC_DEFAULT,
		settings: {
			optimizer: {
				enabled: foundry.default?.optimizer || true,
				runs: foundry.default?.optimizer_runs || 200,
			},
		},
	},
	gasReporter: {
		currency: 'USD',
		gasPrice: 77,
		excludeContracts: ['src/test'],
		coinmarketcap: process.env.CMC_KEY ?? '',
	},
	etherscan: {
		apiKey: process.env.ETHERSCAN_API_KEY ?? '',
	},
};

export default config;
