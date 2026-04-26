// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title PureFi Paymaster (Mock)
 * @dev Mock implementation of a zkSync Era paymaster with AML gating
 */
contract Paymaster {
    address public owner;
    
    constructor() {
        owner = msg.sender;
    }
    
    // In production, this would integrate with PureFi oracle
    function validateAML(address user) external pure returns (bool) {
        // Mock: Accept all except a specific mock blacklisted address
        return user != 0x000000000000000000000000000000000000dEaD;
    }
}
