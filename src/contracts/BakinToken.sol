// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.10;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract BakinToken is ERC20 {
    uint256 public _totalSupply;

    mapping(address => uint256) public balances;
    mapping(address => mapping(address => uint256)) public allowances;

    constructor() ERC20("BakinToken", "BKT") {}

    function totalSupply() public view override returns (uint256) {
        return _totalSupply;
    }

    function balanceOfAcct(address _account) public view returns (uint256) {
        return balances[_account];
    }

    function allowance(address _owner, address _delegate)
        public
        view
        override
        returns (uint256)
    {
        return allowances[_owner][_delegate];
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

    function transferFrom(
        address _owner,
        address _buyer,
        uint256 _amount
    ) public override returns (bool) {
        balances[_owner] -= _amount;
        balances[_buyer] += _amount;
        emit Transfer(_owner, _buyer, _amount);
        return true;
    }

    function mint(address _account, uint256 _amount) public returns (bool) {
        _mint(_account, _amount);
        balances[_account] += _amount;
        _totalSupply += _amount;
        return true;
    }
}