// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.10;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract StakinToken is ERC20 {
    uint256 public _totalSupply;
    address private _owner;

    mapping(address => uint256) public balances;
    mapping(address => mapping(address => uint256)) public allowances;

    constructor() ERC20("StakinToken", "STK") {}

    function balanceOfAcct(address _account) public view returns (uint256) {
        return balances[_account];
    }

    function allowance(address _tokenOwner, address _delegate)
        public
        view
        override
        returns (uint256)
    {
        return allowances[_tokenOwner][_delegate];
    }

    function approve(address _delegate, uint256 _amount)
        public
        override
        returns (bool)
    {
        allowances[msg.sender][_delegate] = _amount;
        emit Approval(msg.sender, _delegate, _amount);
        return true;
    }

    function mint(address _account, uint256 _amount) public payable {
        balances[_account] += _amount;
        _totalSupply += _amount;
        _mint(_account, _amount);
    }

    function transferFrom(
        address _tokenOwner,
        address _buyer,
        uint256 _amount
    ) public override returns (bool) {
        balances[_tokenOwner] -= _amount;
        balances[_buyer] += _amount;
        emit Transfer(_tokenOwner, _buyer, _amount);
        return true;
    }
}