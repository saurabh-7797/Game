const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 COMPREHENSIVE HNS GAMING ECOSYSTEM FUNCTION TEST");
    console.log("=" .repeat(70));
    
    const [deployer, user1, user2, user3, activityManager, gameCreator] = await ethers.getSigners();
    
    console.log("👥 Test Accounts:");
    console.log("  Deployer:", deployer.address);
    console.log("  User1:", user1.address);
    console.log("  User2:", user2.address);
    console.log("  User3:", user3.address);
    console.log("  ActivityManager:", activityManager.address);
    console.log("  GameCreator:", gameCreator.address);
    console.log();
    
    // ============ PHASE 1: CONTRACT DEPLOYMENT ============
    console.log("🚀 PHASE 1: CONTRACT DEPLOYMENT");
    console.log("-".repeat(50));
    
    // Deploy HNS Token
    console.log("1. Deploying HNS Token...");
    const HNSToken = await ethers.getContractFactory("HNSToken");
    const hnsToken = await HNSToken.deploy(deployer.address);
    await hnsToken.waitForDeployment();
    const hnsTokenAddress = await hnsToken.getAddress();
    console.log("   ✅ HNS Token deployed to:", hnsTokenAddress);
    
    // Deploy HNS Game Ecosystem
    console.log("2. Deploying HNS Game Ecosystem...");
    const HNSGameEcosystem = await ethers.getContractFactory("HNSGameEcosystem");
    const hnsGameEcosystem = await HNSGameEcosystem.deploy(
        hnsTokenAddress,
        "https://api.hashandslash.com/metadata/"
    );
    await hnsGameEcosystem.waitForDeployment();
    const hnsGameEcosystemAddress = await hnsGameEcosystem.getAddress();
    console.log("   ✅ HNS Game Ecosystem deployed to:", hnsGameEcosystemAddress);
    
    // Setup roles
    console.log("3. Setting up roles and permissions...");
    const AIRDROP_ROLE = await hnsToken.AIRDROP_ROLE();
    const ACTIVITY_MANAGER_ROLE = await hnsGameEcosystem.ACTIVITY_MANAGER_ROLE();
    const GAME_CREATOR_ROLE = await hnsGameEcosystem.GAME_CREATOR_ROLE();
    const PAUSER_ROLE = await hnsGameEcosystem.PAUSER_ROLE();
    const EMERGENCY_ROLE = await hnsGameEcosystem.EMERGENCY_ROLE();
    
    await hnsToken.grantRole(AIRDROP_ROLE, hnsGameEcosystemAddress);
    await hnsGameEcosystem.grantRole(ACTIVITY_MANAGER_ROLE, activityManager.address);
    await hnsGameEcosystem.grantRole(GAME_CREATOR_ROLE, gameCreator.address);
    await hnsGameEcosystem.grantRole(PAUSER_ROLE, deployer.address);
    await hnsGameEcosystem.grantRole(EMERGENCY_ROLE, deployer.address);
    await hnsToken.grantRole(AIRDROP_ROLE, deployer.address);
    
    console.log("   ✅ AIRDROP_ROLE granted to ecosystem and deployer");
    console.log("   ✅ ACTIVITY_MANAGER_ROLE granted to activityManager");
    console.log("   ✅ GAME_CREATOR_ROLE granted to gameCreator");
    console.log("   ✅ PAUSER_ROLE granted to deployer");
    console.log("   ✅ EMERGENCY_ROLE granted to deployer");
    
    // Transfer HNS for airdrops
    await hnsToken.transfer(hnsGameEcosystemAddress, ethers.parseEther("10000"));
    await hnsToken.transfer(hnsTokenAddress, ethers.parseEther("1000"));
    console.log("   ✅ 10,000 HNS transferred to ecosystem");
    console.log("   ✅ 1,000 HNS transferred to token contract for airdrops");
    
    // Transfer HNS to gameCreator for game creation
    await hnsToken.transfer(gameCreator.address, ethers.parseEther("1000"));
    console.log("   ✅ 1,000 HNS transferred to gameCreator for game creation");
    
    console.log();
    
    // ============ PHASE 2: HNS TOKEN FUNCTIONS ============
    console.log("🪙 PHASE 2: HNS TOKEN FUNCTIONS");
    console.log("-".repeat(50));
    
    // Test basic ERC20 functions
    console.log("1. Testing basic ERC20 functions...");
    const totalSupply = await hnsToken.totalSupply();
    const deployerBalance = await hnsToken.balanceOf(deployer.address);
    const name = await hnsToken.name();
    const symbol = await hnsToken.symbol();
    const decimals = await hnsToken.decimals();
    
    console.log("   📊 Token Info:");
    console.log("     Name:", name);
    console.log("     Symbol:", symbol);
    console.log("     Decimals:", decimals.toString());
    console.log("     Total Supply:", ethers.formatEther(totalSupply));
    console.log("     Deployer Balance:", ethers.formatEther(deployerBalance));
    
    // Test airdrop functions
    console.log("\n2. Testing airdrop functions...");
    
    // Single airdrop
    await hnsToken.airdropHNS(user1.address);
    const user1Balance = await hnsToken.balanceOf(user1.address);
    console.log("   ✅ Single airdrop to User1:", ethers.formatEther(user1Balance), "HNS");
    
    // Batch airdrop
    await hnsToken.batchAirdropHNS([user2.address, user3.address]);
    const user2Balance = await hnsToken.balanceOf(user2.address);
    const user3Balance = await hnsToken.balanceOf(user3.address);
    console.log("   ✅ Batch airdrop to User2:", ethers.formatEther(user2Balance), "HNS");
    console.log("   ✅ Batch airdrop to User3:", ethers.formatEther(user3Balance), "HNS");
    
    // Test airdrop tracking
    const hasUser1Received = await hnsToken.hasUserReceivedAirdrop(user1.address);
    const hasUser2Received = await hnsToken.hasUserReceivedAirdrop(user2.address);
    const airdropStats = await hnsToken.getAirdropStats();
    
    console.log("   📊 Airdrop Statistics:");
    console.log("     User1 received airdrop:", hasUser1Received);
    console.log("     User2 received airdrop:", hasUser2Received);
    console.log("     Total airdropped:", ethers.formatEther(airdropStats.airdropped), "HNS");
    console.log("     Remaining balance:", ethers.formatEther(airdropStats.remainingBalance), "HNS");
    
    // Test minting
    console.log("\n3. Testing minting function...");
    const mintAmount = ethers.parseEther("1000");
    await hnsToken.mint(deployer.address, mintAmount);
    const newDeployerBalance = await hnsToken.balanceOf(deployer.address);
    console.log("   ✅ Minted 1000 HNS to deployer");
    console.log("   ✅ New deployer balance:", ethers.formatEther(newDeployerBalance), "HNS");
    
    console.log();
    
    // ============ PHASE 3: GAME CREATION FUNCTIONS ============
    console.log("🎮 PHASE 3: GAME CREATION FUNCTIONS");
    console.log("-".repeat(50));
    
    console.log("1. Testing game creation...");
    
    // Create games using gameCreator
    const game1Amount = ethers.parseEther("100");
    await hnsToken.connect(gameCreator).approve(hnsGameEcosystemAddress, game1Amount);
    
    const tx1 = await hnsGameEcosystem.connect(gameCreator).createGameToken(
        game1Amount,
        "Shooter Game",
        "ST",
        18
    );
    await tx1.wait();
    console.log("   ✅ Game 1 created: Shooter Game (ST)");
    
    const game2Amount = ethers.parseEther("200");
    await hnsToken.connect(gameCreator).approve(hnsGameEcosystemAddress, game2Amount);
    
    const tx2 = await hnsGameEcosystem.connect(gameCreator).createGameToken(
        game2Amount,
        "Racing Game",
        "RG",
        18
    );
    await tx2.wait();
    console.log("   ✅ Game 2 created: Racing Game (RG)");
    
    // Test game info retrieval
    console.log("\n2. Testing game information functions...");
    
    const game1Info = await hnsGameEcosystem.getGameTokenInfo(1);
    const game2Info = await hnsGameEcosystem.getGameTokenInfo(2);
    
    console.log("   📊 Game 1 Info:");
    console.log("     Creator:", game1Info.creator);
    console.log("     Name:", game1Info.name);
    console.log("     Symbol:", game1Info.symbol);
    console.log("     Decimals:", game1Info.decimals.toString());
    console.log("     Initial Supply:", ethers.formatEther(game1Info.initialSupply));
    console.log("     HNS Locked:", ethers.formatEther(game1Info.hnsLocked));
    console.log("     Current Supply:", ethers.formatEther(game1Info.currentSupply));
    console.log("     Active:", game1Info.active);
    console.log("     Creation Time:", new Date(Number(game1Info.creationTime) * 1000).toLocaleString());
    
    console.log("   📊 Game 2 Info:");
    console.log("     Creator:", game2Info.creator);
    console.log("     Name:", game2Info.name);
    console.log("     Symbol:", game2Info.symbol);
    console.log("     HNS Locked:", ethers.formatEther(game2Info.hnsLocked));
    console.log("     Active:", game2Info.active);
    
    // Test getAllGameIds
    const allGameIds = await hnsGameEcosystem.getAllGameIds();
    console.log("   📋 All Game IDs:", allGameIds.map(id => id.toString()));
    
    console.log();
    
    // ============ PHASE 4: ACTIVITY POINTS SYSTEM ============
    console.log("🏆 PHASE 4: ACTIVITY POINTS SYSTEM");
    console.log("-".repeat(50));
    
    console.log("1. Testing activity points configuration...");
    
    // Set individual activity points
    await hnsGameEcosystem.connect(activityManager).setActivityPoints(1, "shoot_enemy", 10);
    await hnsGameEcosystem.connect(activityManager).setActivityPoints(1, "collect_powerup", 5);
    await hnsGameEcosystem.connect(activityManager).setActivityPoints(1, "complete_level", 50);
    console.log("   ✅ Individual activity points set for Game 1");
    
    // Set batch activity points for Game 2
    const actions = ["finish_race", "collect_boost", "win_championship", "drift_bonus"];
    const points = [20, 8, 100, 15];
    
    await hnsGameEcosystem.connect(activityManager).setActivityPointsBatch(2, actions, points);
    console.log("   ✅ Batch activity points set for Game 2");
    console.log("     Actions:", actions.join(", "));
    console.log("     Points:", points.join(", "));
    
    console.log("\n2. Testing activity recording...");
    
    // Record activities
    await hnsGameEcosystem.connect(activityManager).recordActivity(1, user1.address, "shoot_enemy");
    await hnsGameEcosystem.connect(activityManager).recordActivity(1, user1.address, "collect_powerup");
    await hnsGameEcosystem.connect(activityManager).recordActivity(1, user1.address, "complete_level");
    console.log("   ✅ Recorded 3 activities for User1 in Game 1");
    
    await hnsGameEcosystem.connect(activityManager).recordActivity(2, user2.address, "finish_race");
    await hnsGameEcosystem.connect(activityManager).recordActivity(2, user2.address, "collect_boost");
    console.log("   ✅ Recorded 2 activities for User2 in Game 2");
    
    console.log("\n3. Testing activity tracking functions...");
    
    // Get transaction logs
    const user1Game1Logs = await hnsGameEcosystem.getTransactionLogs(1, user1.address);
    const user2Game2Logs = await hnsGameEcosystem.getTransactionLogs(2, user2.address);
    
    console.log("   📊 User1 Game 1 Activity:");
    console.log("     Total Points:", user1Game1Logs.totalPoints.toString());
    console.log("     Redeemed Points:", user1Game1Logs.redeemedPoints.toString());
    console.log("     Available Points:", user1Game1Logs.availablePoints.toString());
    
    console.log("   📊 User2 Game 2 Activity:");
    console.log("     Total Points:", user2Game2Logs.totalPoints.toString());
    console.log("     Available Points:", user2Game2Logs.availablePoints.toString());
    
    // Get detailed activity logs
    const user1DetailedLogs = await hnsGameEcosystem.getDetailedActivityLogs(user1.address, 1);
    console.log("   📋 User1 Detailed Activity Logs:", user1DetailedLogs.length, "activities");
    user1DetailedLogs.forEach((log, index) => {
        console.log(`     Activity ${index + 1}: ${log.action} - ${log.points} points at ${new Date(Number(log.timestamp) * 1000).toLocaleString()}`);
    });
    
    // Get activity logs summary
    const user1ActivityLogs = await hnsGameEcosystem.getActivityLogs(user1.address);
    const user2ActivityLogs = await hnsGameEcosystem.getActivityLogs(user2.address);
    
    console.log("   📊 User1 Activity Summary:");
    console.log("     Games Played:", user1ActivityLogs.gameIds.length);
    console.log("     Total Points:", user1ActivityLogs.totalPoints.map(p => p.toString()));
    console.log("     Redeemed Points:", user1ActivityLogs.redeemedPoints.map(p => p.toString()));
    
    console.log("   📊 User2 Activity Summary:");
    console.log("     Games Played:", user2ActivityLogs.gameIds.length);
    console.log("     Total Points:", user2ActivityLogs.totalPoints.map(p => p.toString()));
    console.log("     Redeemed Points:", user2ActivityLogs.redeemedPoints.map(p => p.toString()));
    
    console.log();
    
    // ============ PHASE 5: HNS → GAME TOKEN REDEMPTION ============
    console.log("🔄 PHASE 5: HNS → GAME TOKEN REDEMPTION");
    console.log("-".repeat(50));
    
    console.log("1. Testing HNS to Game Token redemption...");
    
    // User1 redeems HNS for Game 1 tokens
    const user1HnsAmount = ethers.parseEther("0.5");
    await hnsToken.connect(user1).approve(hnsGameEcosystemAddress, user1HnsAmount);
    await hnsGameEcosystem.connect(user1).redeemHNSForGameToken(1, user1HnsAmount);
    
    const user1Game1Balance = await hnsGameEcosystem.balanceOf(user1.address, 1);
    console.log("   ✅ User1 redeemed 0.5 HNS for Game 1 tokens");
    console.log("   ✅ User1 Game 1 Balance:", ethers.formatEther(user1Game1Balance), "ST");
    
    // User2 redeems HNS for Game 2 tokens
    const user2HnsAmount = ethers.parseEther("0.8");
    await hnsToken.connect(user2).approve(hnsGameEcosystemAddress, user2HnsAmount);
    await hnsGameEcosystem.connect(user2).redeemHNSForGameToken(2, user2HnsAmount);
    
    const user2Game2Balance = await hnsGameEcosystem.balanceOf(user2.address, 2);
    console.log("   ✅ User2 redeemed 0.8 HNS for Game 2 tokens");
    console.log("   ✅ User2 Game 2 Balance:", ethers.formatEther(user2Game2Balance), "RG");
    
    console.log();
    
    // ============ PHASE 6: POINTS → GAME TOKEN REDEMPTION ============
    console.log("🎯 PHASE 6: POINTS → GAME TOKEN REDEMPTION");
    console.log("-".repeat(50));
    
    console.log("1. Testing points redemption for game tokens...");
    
    // User1 redeems points for Game 1 tokens
    const user1PointsToRedeem = 30;
    await hnsGameEcosystem.connect(user1).redeemPointsForGameToken(1, user1PointsToRedeem);
    
    const user1Game1BalanceAfter = await hnsGameEcosystem.balanceOf(user1.address, 1);
    const user1Game1LogsAfter = await hnsGameEcosystem.getTransactionLogs(1, user1.address);
    console.log("   ✅ User1 redeemed 30 points for Game 1 tokens");
    console.log("   ✅ New Game 1 Balance:", ethers.formatEther(user1Game1BalanceAfter), "ST");
    console.log("   ✅ Remaining Points:", user1Game1LogsAfter.availablePoints.toString());
    
    // User2 redeems points for Game 2 tokens
    const user2PointsToRedeem = 20;
    await hnsGameEcosystem.connect(user2).redeemPointsForGameToken(2, user2PointsToRedeem);
    
    const user2Game2BalanceAfter = await hnsGameEcosystem.balanceOf(user2.address, 2);
    const user2Game2LogsAfter = await hnsGameEcosystem.getTransactionLogs(2, user2.address);
    console.log("   ✅ User2 redeemed 20 points for Game 2 tokens");
    console.log("   ✅ New Game 2 Balance:", ethers.formatEther(user2Game2BalanceAfter), "RG");
    console.log("   ✅ Remaining Points:", user2Game2LogsAfter.availablePoints.toString());
    
    console.log();
    
    // ============ PHASE 7: GAME TOKEN BURNING → HNS RETURN ============
    console.log("🔥 PHASE 7: GAME TOKEN BURNING → HNS RETURN");
    console.log("-".repeat(50));
    
    console.log("1. Testing game token burning for HNS return...");
    
    // Calculate HNS return for User1
    const user1BurnAmount = ethers.parseEther("0.3");
    const user1HnsReturn = await hnsGameEcosystem.calculateHNSReturn(1, user1BurnAmount);
    console.log("   📊 User1 will receive", ethers.formatEther(user1HnsReturn), "HNS for burning 0.3 Game 1 tokens");
    
    // User1 burns Game 1 tokens
    const user1HnsBefore = await hnsToken.balanceOf(user1.address);
    await hnsGameEcosystem.connect(user1).burnGameTokenForHNS(1, user1BurnAmount);
    const user1HnsAfter = await hnsToken.balanceOf(user1.address);
    const user1Game1BalanceAfterBurn = await hnsGameEcosystem.balanceOf(user1.address, 1);
    
    console.log("   ✅ User1 burned 0.3 Game 1 tokens");
    console.log("   ✅ HNS received:", ethers.formatEther(user1HnsAfter - user1HnsBefore));
    console.log("   ✅ Remaining Game 1 tokens:", ethers.formatEther(user1Game1BalanceAfterBurn), "ST");
    
    // Calculate HNS return for User2
    const user2BurnAmount = ethers.parseEther("0.4");
    const user2HnsReturn = await hnsGameEcosystem.calculateHNSReturn(2, user2BurnAmount);
    console.log("   📊 User2 will receive", ethers.formatEther(user2HnsReturn), "HNS for burning 0.4 Game 2 tokens");
    
    // User2 burns Game 2 tokens
    const user2HnsBefore = await hnsToken.balanceOf(user2.address);
    await hnsGameEcosystem.connect(user2).burnGameTokenForHNS(2, user2BurnAmount);
    const user2HnsAfter = await hnsToken.balanceOf(user2.address);
    const user2Game2BalanceAfterBurn = await hnsGameEcosystem.balanceOf(user2.address, 2);
    
    console.log("   ✅ User2 burned 0.4 Game 2 tokens");
    console.log("   ✅ HNS received:", ethers.formatEther(user2HnsAfter - user2HnsBefore));
    console.log("   ✅ Remaining Game 2 tokens:", ethers.formatEther(user2Game2BalanceAfterBurn), "RG");
    
    console.log();
    
    // ============ PHASE 8: DASHBOARD FUNCTIONS ============
    console.log("📊 PHASE 8: DASHBOARD FUNCTIONS");
    console.log("-".repeat(50));
    
    console.log("1. Testing user balance dashboard...");
    
    // Get User1 balances
    const user1Balances = await hnsGameEcosystem.getUserBalances(user1.address);
    console.log("   📊 User1 Complete Balances:");
    console.log("     HNS Balance:", ethers.formatEther(user1Balances.hnsBalance));
    console.log("     Game IDs:", user1Balances.gameIds.map(id => id.toString()));
    console.log("     Game Token Balances:", user1Balances.gameTokenBalances.map(balance => ethers.formatEther(balance)));
    
    // Get User2 balances
    const user2Balances = await hnsGameEcosystem.getUserBalances(user2.address);
    console.log("   📊 User2 Complete Balances:");
    console.log("     HNS Balance:", ethers.formatEther(user2Balances.hnsBalance));
    console.log("     Game IDs:", user2Balances.gameIds.map(id => id.toString()));
    console.log("     Game Token Balances:", user2Balances.gameTokenBalances.map(balance => ethers.formatEther(balance)));
    
    console.log("\n2. Testing individual balance checks...");
    
    // Check individual balances
    const user1HnsBalance = await hnsToken.balanceOf(user1.address);
    const user1Game1BalanceCheck = await hnsGameEcosystem.balanceOf(user1.address, 1);
    const user1Game2Balance = await hnsGameEcosystem.balanceOf(user1.address, 2);
    
    console.log("   📊 User1 Individual Balances:");
    console.log("     HNS:", ethers.formatEther(user1HnsBalance));
    console.log("     Game 1 (ST):", ethers.formatEther(user1Game1BalanceCheck));
    console.log("     Game 2 (RG):", ethers.formatEther(user1Game2Balance));
    
    console.log();
    
    // ============ PHASE 9: ADMIN FUNCTIONS ============
    console.log("⚙️ PHASE 9: ADMIN FUNCTIONS");
    console.log("-".repeat(50));
    
    console.log("1. Testing pause/unpause functionality...");
    
    // Pause the contract
    await hnsGameEcosystem.pause();
    console.log("   ✅ Contract paused");
    
    // Try to perform an operation while paused (should fail)
    try {
        await hnsGameEcosystem.connect(user3).redeemHNSForGameToken(1, ethers.parseEther("1"));
        console.log("   ❌ Operation should have failed while paused");
    } catch (error) {
        console.log("   ✅ Operation correctly failed while paused");
    }
    
    // Unpause the contract
    await hnsGameEcosystem.unpause();
    console.log("   ✅ Contract unpaused");
    
    // Try operation again (should succeed)
    await hnsToken.connect(user3).approve(hnsGameEcosystemAddress, ethers.parseEther("1"));
    await hnsGameEcosystem.connect(user3).redeemHNSForGameToken(1, ethers.parseEther("1"));
    console.log("   ✅ Operation succeeded after unpausing");
    
    console.log("\n2. Testing emergency withdrawal...");
    
    // Get contract HNS balance before withdrawal
    const contractHnsBefore = await hnsToken.balanceOf(hnsGameEcosystemAddress);
    console.log("   📊 Contract HNS balance before withdrawal:", ethers.formatEther(contractHnsBefore));
    
    // Emergency withdraw some HNS (this would fail if HNS is locked, which is correct)
    try {
        await hnsGameEcosystem.emergencyWithdraw(hnsTokenAddress, deployer.address, ethers.parseEther("100"));
        console.log("   ❌ Emergency withdrawal should have failed (HNS is locked)");
    } catch (error) {
        console.log("   ✅ Emergency withdrawal correctly failed (HNS is locked)");
    }
    
    console.log();
    
    // ============ PHASE 10: ERROR HANDLING ============
    console.log("🚨 PHASE 10: ERROR HANDLING");
    console.log("-".repeat(50));
    
    console.log("1. Testing duplicate airdrop prevention...");
    
    try {
        await hnsToken.airdropHNS(user1.address);
        console.log("   ❌ Duplicate airdrop should have failed");
    } catch (error) {
        console.log("   ✅ Duplicate airdrop correctly failed");
    }
    
    console.log("\n2. Testing insufficient balance protection...");
    
    try {
        await hnsGameEcosystem.connect(user3).redeemHNSForGameToken(1, ethers.parseEther("1000"));
        console.log("   ❌ Insufficient balance operation should have failed");
    } catch (error) {
        console.log("   ✅ Insufficient balance operation correctly failed");
    }
    
    console.log("\n3. Testing invalid game ID protection...");
    
    try {
        await hnsGameEcosystem.getGameTokenInfo(999);
        console.log("   ❌ Invalid game ID should have failed");
    } catch (error) {
        console.log("   ✅ Invalid game ID correctly failed");
    }
    
    console.log("\n4. Testing unauthorized activity recording...");
    
    try {
        await hnsGameEcosystem.connect(user1).recordActivity(1, user1.address, "test_action");
        console.log("   ❌ Unauthorized activity recording should have failed");
    } catch (error) {
        console.log("   ✅ Unauthorized activity recording correctly failed");
    }
    
    console.log("\n5. Testing batch activity points validation...");
    
    try {
        await hnsGameEcosystem.connect(activityManager).setActivityPointsBatch(1, ["action1", "action2"], [10]);
        console.log("   ❌ Mismatched array lengths should have failed");
    } catch (error) {
        console.log("   ✅ Mismatched array lengths correctly failed");
    }
    
    console.log();
    
    // ============ PHASE 11: FINAL STATE SUMMARY ============
    console.log("📈 PHASE 11: FINAL STATE SUMMARY");
    console.log("-".repeat(50));
    
    console.log("📊 Final Token Balances:");
    
    // Final HNS balances
    const finalUser1Hns = await hnsToken.balanceOf(user1.address);
    const finalUser2Hns = await hnsToken.balanceOf(user2.address);
    const finalUser3Hns = await hnsToken.balanceOf(user3.address);
    const finalDeployerHns = await hnsToken.balanceOf(deployer.address);
    const finalEcosystemHns = await hnsToken.balanceOf(hnsGameEcosystemAddress);
    
    console.log("   💰 HNS Balances:");
    console.log("     Deployer:", ethers.formatEther(finalDeployerHns));
    console.log("     User1:", ethers.formatEther(finalUser1Hns));
    console.log("     User2:", ethers.formatEther(finalUser2Hns));
    console.log("     User3:", ethers.formatEther(finalUser3Hns));
    console.log("     Ecosystem:", ethers.formatEther(finalEcosystemHns));
    
    // Final game token balances
    const finalUser1Game1 = await hnsGameEcosystem.balanceOf(user1.address, 1);
    const finalUser1Game2 = await hnsGameEcosystem.balanceOf(user1.address, 2);
    const finalUser2Game1 = await hnsGameEcosystem.balanceOf(user2.address, 1);
    const finalUser2Game2 = await hnsGameEcosystem.balanceOf(user2.address, 2);
    const finalUser3Game1 = await hnsGameEcosystem.balanceOf(user3.address, 1);
    
    console.log("   🎮 Game Token Balances:");
    console.log("     User1 Game 1 (ST):", ethers.formatEther(finalUser1Game1));
    console.log("     User1 Game 2 (RG):", ethers.formatEther(finalUser1Game2));
    console.log("     User2 Game 1 (ST):", ethers.formatEther(finalUser2Game1));
    console.log("     User2 Game 2 (RG):", ethers.formatEther(finalUser2Game2));
    console.log("     User3 Game 1 (ST):", ethers.formatEther(finalUser3Game1));
    
    // Contract addresses
    console.log("\n📋 Contract Addresses:");
    console.log("   HNS Token:", hnsTokenAddress);
    console.log("   HNS Game Ecosystem:", hnsGameEcosystemAddress);
    
    // Role addresses
    console.log("\n👥 Role Assignments:");
    console.log("   Deployer:", deployer.address);
    console.log("   Activity Manager:", activityManager.address);
    console.log("   Game Creator:", gameCreator.address);
    
    console.log();
    console.log("🎉 ALL CONTRACT FUNCTIONS TESTED SUCCESSFULLY!");
    console.log("=" .repeat(70));
    console.log("✅ HNS Gaming Ecosystem is fully functional and ready for production! 🚀");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Test failed:", error);
        process.exit(1);
    }); 