// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.10;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./StakinToken.sol";

/***********************************************
 *  INTERFACES
 ***********************************************/

/// @notice Need this specific interface to allow special minting privileges for BKT; not needed for STK
interface IBakinToken {
    function totalSupply() external view returns (uint256);

    function balanceOf() external view returns (uint256);

    function allowance(address _owner, address _delegate)
        external
        view
        returns (uint256);

    function approve(address _delegate, uint256 _amount)
        external
        returns (bool);

    function transferFrom(
        address _owner,
        address _buyer,
        uint256 _amount
    ) external returns (bool);

    function mint(address _account, uint256 _amount) external returns (bool);
}

/**
 * @title Stakeable
 * @author 0xGenghisGoose
 * @notice Stores all logic for staking, unstaking and rewarding
 */
contract Stakeable {
    /***********************************************
     *  PUBLIC & PRIVATE STORAGE
     ***********************************************/

    StakinToken public stakinToken;
    IBakinToken public bakinToken;

    // rate used to calcuate reward
    uint256 public rewardRate = 100;

    // last time `updateReward` was called
    uint256 public lastUpdateTime;

    // amount of BKT to reward per STK staked
    uint256 public rewardPerTokenStaked;

    // total number of STK staked in the contract
    uint256 private _totalSupply;

    // price of each Stakin Token
    uint256 private constant stakinPrice = 0.001 ether;

    struct Stake {
        uint256 amount;
        address from;
    }

    /// @notice all user stakes on platform for querying purposes
    Stake[] public stakes;

    /// @notice Total BakinToken rewards per address
    mapping(address => uint256) public rewards;

    /// @notice User balance of StakinTokens staked in the contract
    mapping(address => uint256) public balances; // User balance of stakinToken staked

    /***********************************************
     *  EVENTS & MODIFIERS
     ***********************************************/

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event BakinReward(address indexed user, uint256 amount);

    modifier updateReward(address _account) {
        balances[_account] = userStakinBalance(_account);
        rewardPerTokenStaked = rewardPerToken();
        lastUpdateTime = block.timestamp;
        rewards[_account] = earned(_account);
        _;
    }

    /**
     * @notice initializes the contract with the Stakin Tokens & Bakin Tokens instantiations
     * @param _stakinToken - address of STK
     * @param _bakinToken - address of BKT
     */
    constructor(address _stakinToken, address _bakinToken) {
        stakinToken = StakinToken(_stakinToken);
        bakinToken = IBakinToken(_bakinToken);
    }

    /**
     * @notice Returns the amount of BKT rewards per STK a user has staked
     * @dev All of the reward functions are arbitrary; this was not meant to be a fully functioning protocol, just some smart contracts that functioned as a simple staking pool with its own rewards
     */
    function rewardPerToken() public view returns (uint256) {
        if (_totalSupply == 0) {
            return 0;
        }
        return ((block.timestamp - lastUpdateTime) * rewardRate);
    }

    /**
     * @notice Caclulates amount of BKT rewards in Wei for a specific address
     * @dev Both this & rewardPerToken() are used in the modifier to calcuate BKT earnings for a user
     * @param _account - Address of user trying to calculate their BKT rewards
     */
    function earned(address _account) public view returns (uint256) {
        uint256 earnings = ((balances[_account] * rewardPerToken()) +
            rewards[_account] +
            5);
        uint256 earningsInWei = earnings * 1e18;
        return earningsInWei;
    }

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function balanceOfAcct(address _account) public view returns (uint256) {
        return balances[_account];
    }

    function userStakinBalance(address _account) public view returns (uint256) {
        uint256 numToken = stakinToken.balanceOf(_account);
        return numToken;
    }

    function resetReward(address _account) internal {
        rewards[_account] = 0;
    }

    /**
     * @notice Mints new Stakin Tokens
     * @dev No reentrancy checks here, again just for fun
     * @param _amount - Amount of STK a user wishes to buy
     */
    function buyStakin(uint256 _amount) external payable {
        require(_amount > 0, "Must input number of Stakin Tokens to buy");
        uint256 stakinSale = _amount * 1e18;
        stakinToken.mint(msg.sender, stakinSale);
    }

    /**
     * @notice Stakes a given amount of STK into the contract
     * @dev approve() will be called from the frontend when staking
     * @param _amount - Amount of STK a user wishes to stake for rewards
     */
    function stake(uint256 _amount) external {
        _totalSupply += _amount;
        balances[msg.sender] += _amount;
        stakes.push(Stake({amount: _amount, from: msg.sender}));
        stakinToken.transferFrom(msg.sender, address(this), _amount);
        emit Staked(msg.sender, _amount);
    }

    /**
     * @notice Unstakes a given amount of STK into the contract
     * @param _amount - Amount of STK a user wishes to unstake
     */
    function unstake(uint256 _amount) external {
        require(_amount <= balances[msg.sender]);
        _totalSupply -= _amount;
        balances[msg.sender] -= _amount;
        stakinToken.transferFrom(address(this), msg.sender, _amount);
        emit Unstaked(msg.sender, _amount);
    }

    /**
     * @notice Using helper functions to calculate BKT rewards for the caller, then mints the BKT rewards direct to the caller
     * @dev Due to the way rewards are calculated, you will very most likely need to have STK staked to earn more BKT rewards than the arbitrary 5 tokens generally given now
     */
    function withdrawBakinRewards()
        external
        updateReward(msg.sender)
        returns (bool)
    {
        uint256 reward = rewards[msg.sender];
        bakinToken.mint(msg.sender, reward);
        resetReward(msg.sender);
        emit BakinReward(msg.sender, reward);
        return true;
    }

    receive() external payable {}

    fallback() external payable {}
}