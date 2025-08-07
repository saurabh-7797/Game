// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "./HNSToken.sol";

/**
 * @title HNSGameEcosystem
 * @dev HashAndSlash Gaming Ecosystem - Main contract implementing the HNS flow
 * Flow: HNS → Game Tokens (ERC-1155) → Activity Points → Game Tokens → Burn → HNS
 * Features:
 * - Admin-controlled game creation
 * - Activity points system
 * - ERC-1155 for gas-efficient game tokens
 * - Comprehensive dashboard functions
 */
contract HNSGameEcosystem is ERC1155, AccessControl, Pausable, ReentrancyGuard {
    using Math for uint256;

    // ============ Constants ============
    bytes32 public constant GAME_CREATOR_ROLE = keccak256("GAME_CREATOR_ROLE");
    bytes32 public constant ACTIVITY_MANAGER_ROLE = keccak256("ACTIVITY_MANAGER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");
    
    uint256 public constant MIN_HNS_LOCK_AMOUNT = 1 * 1e18; // Minimum 1 HNS to create game token
    uint256 public constant MAX_GAME_TOKEN_DECIMALS = 18;
    uint256 public constant PRECISION_FACTOR = 1e18;
    uint256 public constant MAX_NAME_LENGTH = 100;
    uint256 public constant MAX_SYMBOL_LENGTH = 10;
    uint256 public constant MAX_ACTIVITY_POINTS = 1000; // Max points per activity
    
    // ============ State Variables ============
    IERC20 public immutable hnsToken;
    
    uint256 public nextGameId = 1; // Start from 1 for better UX
    uint256 public hnsReserves; // HNS held for game token redemptions
    
    // Game token information
    struct GameTokenInfo {
        address creator;         // 20 bytes
        string name;            // Stored separately for gas optimization
        string symbol;          // Stored separately for gas optimization
        uint8 decimals;         // 1 byte
        uint256 initialSupply;  // 32 bytes
        uint256 hnsLocked;      // 32 bytes
        uint256 currentSupply;  // 32 bytes
        bool active;            // 1 byte
        uint256 creationTime;   // 32 bytes
    }
    
    // Activity tracking
    struct ActivityLog {
        uint256 gameId;
        string action;
        uint256 points;
        uint256 timestamp;
    }
    
    struct UserActivity {
        uint256 totalPoints;
        uint256 redeemedPoints;
        ActivityLog[] activities;
    }
    
    // Mappings
    mapping(uint256 => GameTokenInfo) public gameTokens;
    mapping(address => mapping(uint256 => UserActivity)) public userActivities; // user => gameId => activity
    mapping(address => uint256[]) public userGameTokens; // Track user's game token balances
    mapping(string => bool) public gameNames; // Prevent duplicate game names
    mapping(uint256 => mapping(string => uint256)) public activityPointValues; // gameId => action => points
    
    // ============ Events ============
    event GameTokenCreated(
        uint256 indexed gameId,
        address indexed creator,
        string name,
        string symbol,
        uint256 hnsLocked,
        uint256 initialSupply
    );
    event GameTokenBurned(
        uint256 indexed gameId,
        address indexed user,
        uint256 burnAmount,
        uint256 hnsReturned
    );
    event ActivityRecorded(
        uint256 indexed gameId,
        address indexed user,
        string action,
        uint256 points
    );
    event PointsRedeemed(
        uint256 indexed gameId,
        address indexed user,
        uint256 points,
        uint256 gameTokensReceived
    );
    event ActivityPointsSet(
        uint256 indexed gameId,
        string action,
        uint256 points
    );
    
    // ============ Errors ============
    error ZeroAmount();
    error ZeroAddress();
    error InvalidGameId(uint256 provided, uint256 maxValid);
    error InvalidDecimals(uint8 provided, uint8 maxAllowed);
    error InsufficientAmount(uint256 provided, uint256 required);
    error GameTokenNotActive(uint256 gameId);
    error DuplicateGameName(string name);
    error InsufficientHnsReserves(uint256 required, uint256 available);
    error InsufficientUserBalance(address user, uint256 required, uint256 available);
    error InsufficientAllowance(address user, address spender, uint256 required, uint256 current);
    error InvalidActivityPoints(uint256 points, uint256 maxAllowed);
    error ActivityNotConfigured(uint256 gameId, string action);
    error InsufficientPoints(uint256 required, uint256 available);
    error EmptyString(string fieldName);
    error StringTooLong(string fieldName, uint256 length, uint256 maxLength);
    
    // ============ Constructor ============
    constructor(
        address _hnsToken,
        string memory _baseURI
    ) ERC1155(_baseURI) {
        if (_hnsToken == address(0)) revert ZeroAddress();
        
        hnsToken = IERC20(_hnsToken);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GAME_CREATOR_ROLE, msg.sender);
        _grantRole(ACTIVITY_MANAGER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(EMERGENCY_ROLE, msg.sender);
    }
    
    // ============ Admin Game Creation ============
    /**
     * @dev Create a new game token (admin only)
     * @param hnsAmount Amount of HNS to lock for this game
     * @param name Name of the game
     * @param symbol Symbol of the game token
     * @param decimals Decimals for the game token
     */
    function createGameToken(
        uint256 hnsAmount,
        string calldata name,
        string calldata symbol,
        uint8 decimals
    ) 
        external 
        onlyRole(GAME_CREATOR_ROLE)
        whenNotPaused 
        nonReentrant 
        returns (uint256 gameId)
    {
        // Input validation
        if (hnsAmount < MIN_HNS_LOCK_AMOUNT) {
            revert InsufficientAmount(hnsAmount, MIN_HNS_LOCK_AMOUNT);
        }
        if (decimals > MAX_GAME_TOKEN_DECIMALS) {
            revert InvalidDecimals(decimals, uint8(MAX_GAME_TOKEN_DECIMALS));
        }
        if (bytes(name).length == 0) revert EmptyString("name");
        if (bytes(symbol).length == 0) revert EmptyString("symbol");
        if (bytes(name).length > MAX_NAME_LENGTH) {
            revert StringTooLong("name", bytes(name).length, MAX_NAME_LENGTH);
        }
        if (bytes(symbol).length > MAX_SYMBOL_LENGTH) {
            revert StringTooLong("symbol", bytes(symbol).length, MAX_SYMBOL_LENGTH);
        }
        if (gameNames[name]) revert DuplicateGameName(name);
        
        // Transfer HNS from admin to contract
        bool transferSuccess = hnsToken.transferFrom(msg.sender, address(this), hnsAmount);
        if (!transferSuccess) {
            revert("HNS transfer failed");
        }
        
        gameId = nextGameId++;
        hnsReserves += hnsAmount;
        
        // Calculate initial supply
        uint256 initialSupply = hnsAmount * (10 ** decimals) / PRECISION_FACTOR;
        
        // Store game token info
        gameTokens[gameId] = GameTokenInfo({
            creator: msg.sender,
            name: name,
            symbol: symbol,
            decimals: decimals,
            initialSupply: initialSupply,
            hnsLocked: hnsAmount,
            currentSupply: initialSupply,
            active: true,
            creationTime: block.timestamp
        });
        
        gameNames[name] = true;
        
        // Mint initial supply to admin
        _mint(msg.sender, gameId, initialSupply, "");
        
        emit GameTokenCreated(gameId, msg.sender, name, symbol, hnsAmount, initialSupply);
    }
    
    // ============ HNS → Game Token Redemption ============
    /**
     * @dev Redeem HNS for game tokens
     * @param gameId ID of the game token
     * @param hnsAmount Amount of HNS to redeem
     */
    function redeemHNSForGameToken(uint256 gameId, uint256 hnsAmount) 
        external 
        whenNotPaused 
        nonReentrant 
    {
        if (hnsAmount == 0) revert ZeroAmount();
        if (gameId == 0 || gameId >= nextGameId) {
            revert InvalidGameId(gameId, nextGameId - 1);
        }
        
        GameTokenInfo storage gameInfo = gameTokens[gameId];
        if (!gameInfo.active) revert GameTokenNotActive(gameId);
        
        // Validate user has sufficient HNS
        uint256 userBalance = hnsToken.balanceOf(msg.sender);
        if (userBalance < hnsAmount) {
            revert InsufficientUserBalance(msg.sender, hnsAmount, userBalance);
        }
        
        uint256 allowance = hnsToken.allowance(msg.sender, address(this));
        if (allowance < hnsAmount) {
            revert InsufficientAllowance(msg.sender, address(this), hnsAmount, allowance);
        }
        
        // Calculate game tokens to receive
        uint256 gameTokensToReceive = (hnsAmount * gameInfo.initialSupply) / gameInfo.hnsLocked;
        
        // Transfer HNS from user to contract
        bool transferSuccess = hnsToken.transferFrom(msg.sender, address(this), hnsAmount);
        if (!transferSuccess) revert("HNS transfer failed");
        
        hnsReserves += hnsAmount;
        gameInfo.hnsLocked += hnsAmount;
        gameInfo.currentSupply += gameTokensToReceive;
        
        // Mint game tokens to user
        _mint(msg.sender, gameId, gameTokensToReceive, "");
        
        // Track user's game tokens
        if (balanceOf(msg.sender, gameId) == gameTokensToReceive) {
            userGameTokens[msg.sender].push(gameId);
        }
    }
    
    // ============ Activity Points System ============
    /**
     * @dev Record user activity and award points
     * @param gameId ID of the game
     * @param user Address of the user
     * @param action Action performed
     */
    function recordActivity(
        uint256 gameId,
        address user,
        string calldata action
    ) 
        external 
        onlyRole(ACTIVITY_MANAGER_ROLE)
        whenNotPaused 
    {
        if (gameId == 0 || gameId >= nextGameId) {
            revert InvalidGameId(gameId, nextGameId - 1);
        }
        if (user == address(0)) revert ZeroAddress();
        if (bytes(action).length == 0) revert EmptyString("action");
        
        GameTokenInfo storage gameInfo = gameTokens[gameId];
        if (!gameInfo.active) revert GameTokenNotActive(gameId);
        
        uint256 points = activityPointValues[gameId][action];
        if (points == 0) revert ActivityNotConfigured(gameId, action);
        if (points > MAX_ACTIVITY_POINTS) {
            revert InvalidActivityPoints(points, MAX_ACTIVITY_POINTS);
        }
        
        UserActivity storage userActivity = userActivities[user][gameId];
        userActivity.totalPoints += points;
        
        // Store activity log
        userActivity.activities.push(ActivityLog({
            gameId: gameId,
            action: action,
            points: points,
            timestamp: block.timestamp
        }));
        
        emit ActivityRecorded(gameId, user, action, points);
    }
    
    /**
     * @dev Set activity point values for a game
     * @param gameId ID of the game
     * @param action Action name
     * @param points Points to award
     */
    function setActivityPoints(
        uint256 gameId,
        string calldata action,
        uint256 points
    ) 
        external 
        onlyRole(ACTIVITY_MANAGER_ROLE)
    {
        if (gameId == 0 || gameId >= nextGameId) {
            revert InvalidGameId(gameId, nextGameId - 1);
        }
        if (bytes(action).length == 0) revert EmptyString("action");
        if (points > MAX_ACTIVITY_POINTS) {
            revert InvalidActivityPoints(points, MAX_ACTIVITY_POINTS);
        }
        
        activityPointValues[gameId][action] = points;
        emit ActivityPointsSet(gameId, action, points);
    }
    
    // ============ Points → Game Token Redemption ============
    /**
     * @dev Redeem activity points for game tokens
     * @param gameId ID of the game
     * @param points Amount of points to redeem
     */
    function redeemPointsForGameToken(uint256 gameId, uint256 points) 
        external 
        whenNotPaused 
        nonReentrant 
    {
        if (points == 0) revert ZeroAmount();
        if (gameId == 0 || gameId >= nextGameId) {
            revert InvalidGameId(gameId, nextGameId - 1);
        }
        
        GameTokenInfo storage gameInfo = gameTokens[gameId];
        if (!gameInfo.active) revert GameTokenNotActive(gameId);
        
        UserActivity storage userActivity = userActivities[msg.sender][gameId];
        uint256 availablePoints = userActivity.totalPoints - userActivity.redeemedPoints;
        
        if (availablePoints < points) {
            revert InsufficientPoints(points, availablePoints);
        }
        
        // Calculate game tokens to receive (1 point = 1 game token)
        uint256 gameTokensToReceive = points;
        
        // Update user activity
        userActivity.redeemedPoints += points;
        
        // Mint game tokens to user
        _mint(msg.sender, gameId, gameTokensToReceive, "");
        gameInfo.currentSupply += gameTokensToReceive;
        
        // Track user's game tokens
        if (balanceOf(msg.sender, gameId) == gameTokensToReceive) {
            userGameTokens[msg.sender].push(gameId);
        }
        
        emit PointsRedeemed(gameId, msg.sender, points, gameTokensToReceive);
    }
    
    // ============ Game Token Burning → HNS Return ============
    /**
     * @dev Burn game tokens to receive HNS back
     * @param gameId ID of the game token
     * @param burnAmount Amount of game tokens to burn
     */
    function burnGameTokenForHNS(uint256 gameId, uint256 burnAmount) 
        external 
        whenNotPaused 
        nonReentrant 
    {
        if (burnAmount == 0) revert ZeroAmount();
        if (gameId == 0 || gameId >= nextGameId) {
            revert InvalidGameId(gameId, nextGameId - 1);
        }
        
        GameTokenInfo storage gameInfo = gameTokens[gameId];
        if (!gameInfo.active) revert GameTokenNotActive(gameId);
        
        // Validate user has sufficient game tokens
        uint256 userBalance = balanceOf(msg.sender, gameId);
        if (userBalance < burnAmount) {
            revert InsufficientUserBalance(msg.sender, burnAmount, userBalance);
        }
        
        // Calculate HNS to return
        uint256 hnsToReturn = (burnAmount * gameInfo.hnsLocked) / gameInfo.initialSupply;
        
        if (hnsReserves < hnsToReturn) {
            revert InsufficientHnsReserves(hnsToReturn, hnsReserves);
        }
        
        // Burn game tokens
        _burn(msg.sender, gameId, burnAmount);
        
        // Update state
        gameInfo.currentSupply -= burnAmount;
        hnsReserves -= hnsToReturn;
        
        // Transfer HNS to user
        bool transferSuccess = hnsToken.transfer(msg.sender, hnsToReturn);
        if (!transferSuccess) revert("HNS transfer failed");
        
        emit GameTokenBurned(gameId, msg.sender, burnAmount, hnsToReturn);
    }
    
    // ============ Admin Functions ============
    /**
     * @dev Pause contract operations
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause contract operations
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }
    
    /**
     * @dev Emergency withdraw function
     */
    function emergencyWithdraw(
        address token,
        address to,
        uint256 amount
    ) external onlyRole(EMERGENCY_ROLE) {
        if (to == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();
        
        if (token == address(hnsToken) && hnsReserves > 0) {
            revert("Cannot withdraw HNS while tokens are locked");
        }
        
        IERC20(token).transfer(to, amount);
    }
    
    // ============ Dashboard View Functions ============
    /**
     * @dev Get user balances for HNS and all game tokens
     * @param user Address of the user
     */
    function getUserBalances(address user) 
        external 
        view 
        returns (
            uint256 hnsBalance,
            uint256[] memory gameIds,
            uint256[] memory gameTokenBalances
        ) 
    {
        hnsBalance = hnsToken.balanceOf(user);
        gameIds = userGameTokens[user];
        gameTokenBalances = new uint256[](gameIds.length);
        
        for (uint256 i = 0; i < gameIds.length; i++) {
            gameTokenBalances[i] = balanceOf(user, gameIds[i]);
        }
    }
    
    /**
     * @dev Get user activity logs
     * @param user Address of the user
     */
    function getActivityLogs(address user) 
        external 
        view 
        returns (
            uint256[] memory gameIds,
            uint256[] memory totalPoints,
            uint256[] memory redeemedPoints
        ) 
    {
        uint256[] memory allGameIds = userGameTokens[user];
        gameIds = new uint256[](allGameIds.length);
        totalPoints = new uint256[](allGameIds.length);
        redeemedPoints = new uint256[](allGameIds.length);
        
        for (uint256 i = 0; i < allGameIds.length; i++) {
            uint256 gameId = allGameIds[i];
            UserActivity storage activity = userActivities[user][gameId];
            
            gameIds[i] = gameId;
            totalPoints[i] = activity.totalPoints;
            redeemedPoints[i] = activity.redeemedPoints;
        }
    }
    
    /**
     * @dev Get detailed activity logs for a specific game
     * @param user Address of the user
     * @param gameId ID of the game
     */
    function getDetailedActivityLogs(address user, uint256 gameId) 
        external 
        view 
        returns (ActivityLog[] memory activities)
    {
        return userActivities[user][gameId].activities;
    }
    
    /**
     * @dev Get transaction logs for a game and user
     * @param gameId ID of the game
     * @param user Address of the user
     */
    function getTransactionLogs(uint256 gameId, address user) 
        external 
        view 
        returns (
            uint256 gameTokenBalance,
            uint256 totalPoints,
            uint256 redeemedPoints,
            uint256 availablePoints
        ) 
    {
        gameTokenBalance = balanceOf(user, gameId);
        UserActivity storage activity = userActivities[user][gameId];
        totalPoints = activity.totalPoints;
        redeemedPoints = activity.redeemedPoints;
        availablePoints = totalPoints - redeemedPoints;
    }
    
    /**
     * @dev Get game token information
     * @param gameId ID of the game
     */
    function getGameTokenInfo(uint256 gameId) 
        external 
        view 
        returns (GameTokenInfo memory)
    {
        return gameTokens[gameId];
    }
    
    /**
     * @dev Calculate HNS return for burning game tokens
     * @param gameId ID of the game
     * @param burnAmount Amount to burn
     */
    function calculateHNSReturn(uint256 gameId, uint256 burnAmount) 
        external 
        view 
        returns (uint256)
    {
        if (gameId == 0 || gameId >= nextGameId) return 0;
        
        GameTokenInfo memory gameInfo = gameTokens[gameId];
        if (!gameInfo.active) return 0;
        
        return (burnAmount * gameInfo.hnsLocked) / gameInfo.initialSupply;
    }
    
    /**
     * @dev Get all game IDs
     */
    function getAllGameIds() external view returns (uint256[] memory) {
        uint256[] memory gameIds = new uint256[](nextGameId - 1);
        for (uint256 i = 1; i < nextGameId; i++) {
            gameIds[i - 1] = i;
        }
        return gameIds;
    }
    
    // ============ Override Functions ============
    /**
     * @dev Override supportsInterface to resolve conflict between ERC1155 and AccessControl
     */
    function supportsInterface(bytes4 interfaceId) 
        public 
        view 
        override(ERC1155, AccessControl) 
        returns (bool) 
    {
        return super.supportsInterface(interfaceId);
    }
    
    /**
     * @dev Override to add pause functionality
     */
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override whenNotPaused {
        super._update(from, to, ids, values);
    }
} 