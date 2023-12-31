// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RealEstateToken is ERC20 {
    constructor(address initialOwner)
        ERC20("RealEstateToken", "RET")
    {}

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
} 