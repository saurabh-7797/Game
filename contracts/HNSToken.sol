// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title HNSToken
 * @dev HashAndSlash (HNS) Token - Core platform token for the gaming ecosystem
 * Users receive 1 HNS via airdrop when joining the platform
 */
contract HNSToken is ERC20, AccessControl {
    
    // ============ Constants ============
    bytes32 public constant AIRDROP_ROLE = keccak256("AIRDROP_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    
    uint256 public constant INITIAL_SUPPLY = 1_000_000_000 * 1e18; // 1 billion tokens
    uint256 public constant AIRDROP_AMOUNT = 1 * 1e18; // 1 HNS per user
    
    // ============ State Variables ============
    mapping(address => bool) public hasReceivedAirdrop;
    uint256 public totalAirdropped;
    
    // ============ Events ============
    event AirdropSent(address indexed user, uint256 amount);
    
    // ============ Errors ============
    error AlreadyReceivedAirdrop(address user);
    error InsufficientAirdropBalance(uint256 required, uint256 available);
    
    // ============ Constructor ============
    constructor(
        address admin
    ) ERC20("HashAndSlash Token", "HNS") {
        if (admin == address(0)) revert("Invalid admin address");
        
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(AIRDROP_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
        
        _mint(admin, INITIAL_SUPPLY);
    }
    
    // ============ Airdrop Function ============
    /**
     * @dev Airdrop 1 HNS token to a new user
     * @param user Address of the user to airdrop to
     */
    function airdropHNS(address user) external onlyRole(AIRDROP_ROLE) {
        if (user == address(0)) revert("Invalid user address");
        if (hasReceivedAirdrop[user]) revert AlreadyReceivedAirdrop(user);
        
        uint256 contractBalance = balanceOf(address(this));
        if (contractBalance < AIRDROP_AMOUNT) {
            revert InsufficientAirdropBalance(AIRDROP_AMOUNT, contractBalance);
        }
        
        hasReceivedAirdrop[user] = true;
        totalAirdropped += AIRDROP_AMOUNT;
        
        _transfer(address(this), user, AIRDROP_AMOUNT);
        emit AirdropSent(user, AIRDROP_AMOUNT);
    }
    
    /**
     * @dev Batch airdrop to multiple users
     * @param users Array of user addresses
     */
    function batchAirdropHNS(address[] calldata users) external onlyRole(AIRDROP_ROLE) {
        uint256 totalNeeded = users.length * AIRDROP_AMOUNT;
        uint256 contractBalance = balanceOf(address(this));
        
        if (contractBalance < totalNeeded) {
            revert InsufficientAirdropBalance(totalNeeded, contractBalance);
        }
        
        for (uint256 i = 0; i < users.length; i++) {
            address user = users[i];
            if (user == address(0)) continue; // Skip invalid addresses
            if (hasReceivedAirdrop[user]) continue; // Skip already airdropped
            
            hasReceivedAirdrop[user] = true;
            totalAirdropped += AIRDROP_AMOUNT;
            
            _transfer(address(this), user, AIRDROP_AMOUNT);
            emit AirdropSent(user, AIRDROP_AMOUNT);
        }
    }
    
    // ============ Minting Function ============
    /**
     * @dev Mint additional tokens (for admin use)
     */
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        if (to == address(0)) revert("Invalid recipient address");
        if (amount == 0) revert("Amount must be greater than 0");
        
        _mint(to, amount);
    }
    
    // ============ View Functions ============
    /**
     * @dev Check if user has received airdrop
     */
    function hasUserReceivedAirdrop(address user) external view returns (bool) {
        return hasReceivedAirdrop[user];
    }
    
    /**
     * @dev Get airdrop statistics
     */
    function getAirdropStats() external view returns (uint256 airdropped, uint256 remainingBalance) {
        return (totalAirdropped, balanceOf(address(this)));
    }
} 