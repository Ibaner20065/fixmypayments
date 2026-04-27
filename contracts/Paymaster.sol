// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title PureFiPaymaster
 * @dev zkSync Era Paymaster with PureFi AML verification
 * 
 * Flow:
 * 1. Front-end requests AML verification from PureFi Issuer API
 * 2. Issuer returns: verifiedUser + rule_id + expiry + ECDSA signature
 * 3. dApp encodes as Paymaster input
 * 4. Paymaster validates: recover signer → check ISSUER_ROLE → check expiry
 * 5. On validation success: Store AML context data[target] = (ruleId, expiry)
 * 6. FilteredPool reads context: require(msg.sender == verifiedUser)
 * 7. Post-transaction: Paymaster erases context (re-entrancy guard)
 */
contract PureFiPaymaster is Ownable, ReentrancyGuard {
    // PureFi Issuer Configuration
    address public pureFiIssuer;
    
    // AML Verification Context (user → rule_id, expiry)
    mapping(address => AMLContext) public amlContext;
    
    // Event logging
    event PaymasterValidation(address indexed user, uint256 ruleId, uint256 expiry, bool success);
    event AMLContextCleared(address indexed user);
    
    struct AMLContext {
        uint256 ruleId;
        uint256 expiry;
        address verifiedUser;
    }
    
    constructor(address _issuer) {
        pureFiIssuer = _issuer;
    }
    
    /**
     * @dev Update PureFi Issuer address (only owner)
     */
    function setPureFiIssuer(address _issuer) external onlyOwner {
        require(_issuer != address(0), "Invalid issuer address");
        pureFiIssuer = _issuer;
    }
    
    /**
     * @dev Validate AML for a user (called by dApp)
     * 
     * Params (abi.encode'd):
     *   - sessionId: uint256
     *   - ruleId: uint256 (e.g., 0x01 for deposit, 0x02 for withdraw)
     *   - expiry: uint256 (timestamp)
     *   - signature: bytes (ECDSA of above)
     */
    function validateAML(
        address target,
        uint256 sessionId,
        uint256 ruleId,
        uint256 expiry,
        bytes calldata signature
    ) external nonReentrant returns (bool) {
        // Check expiry
        require(block.timestamp <= expiry, "AML verification expired");
        
        // Verify ECDSA signature from PureFi Issuer
        bytes32 messageHash = keccak256(abi.encodePacked(
            target,
            sessionId,
            ruleId,
            expiry
        ));
        bytes32 ethSignedHash = keccak256(abi.encodePacked(
            "\x19Ethereum Signed Message:\n32",
            messageHash
        ));
        
        address signer = recoverSigner(ethSignedHash, signature);
        require(signer == pureFiIssuer, "Invalid AML signature");
        
        // Store context for FilteredPool to read
        amlContext[target] = AMLContext({
            ruleId: ruleId,
            expiry: expiry,
            verifiedUser: target
        });
        
        emit PaymasterValidation(target, ruleId, expiry, true);
        return true;
    }
    
    /**
     * @dev Check if user has valid AML verification
     */
    function isAMLVerified(address user) external view returns (bool) {
        AMLContext memory context = amlContext[user];
        return context.expiry > 0 && block.timestamp <= context.expiry;
    }
    
    /**
     * @dev Get AML context for user
     */
    function getAMLContext(address user) external view returns (AMLContext memory) {
        return amlContext[user];
    }
    
    /**
     * @dev Clear AML context (re-entrancy guard pattern)
     * Called post-transaction by paymaster
     */
    function clearAMLContext(address user) external onlyOwner {
        delete amlContext[user];
        emit AMLContextCleared(user);
    }
    
    /**
     * @dev Recover signer from ECDSA signature
     */
    function recoverSigner(bytes32 messageHash, bytes calldata signature) 
        internal 
        pure 
        returns (address) 
    {
        require(signature.length == 65, "Invalid signature length");
        
        bytes32 r;
        bytes32 s;
        uint8 v;
        
        assembly {
            r := calldataload(add(signature.offset, 0x00))
            s := calldataload(add(signature.offset, 0x20))
            v := byte(0, calldataload(add(signature.offset, 0x40)))
        }
        
        if (v < 27) {
            v += 27;
        }
        require(v == 27 || v == 28, "Invalid signature v value");
        
        return ecrecover(messageHash, v, r, s);
    }
}
