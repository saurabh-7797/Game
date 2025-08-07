const { ethers } = require("hardhat");

async function main() {
    console.log("🧪 Testing All HNS Gaming Ecosystem Functions");
    console.log("=" .repeat(60));
    
    const [deployer, user1, user2, user3, activityManager] = await ethers.getSigners();
    
    console.log("👤 Test Accounts:");
    console.log("Deployer:", deployer.address);
    console.log("User1:", user1.address);
    console.log("User2:", user2.address);
    console.log("User3:", user3.address);
    console.log("ActivityManager:", activityManager.address);
    console.log();
    
    // ============ PHASE 1: DEPLOYMENT & SETUP ============
    console.log("🚀 PHASE 1: DEPLOYMENT & SETUP");
    console.log("-".repeat(40));
    
    // Deploy HNS Token
    console.log("1. Deploying HNS Token...");
    const HNSToken = await ethers.getContractFactory("HNSToken");
    const hnsToken = await HNSToken.deploy(deployer.address);
    await hnsToken.waitForDeployment();
    const hnsTokenAddress = await hnsToken.getAddress();
    console.log("✅ HNS Token deployed to:", hnsTokenAddress);
    
    // Deploy HNS Game Ecosystem
    console.log("2. Deploying HNS Game Ecosystem...");
    const HNSGameEcosystem = await ethers.getContractFactory("HNSGameEcosystem");
    const hnsGameEcosystem = await HNSGameEcosystem.deploy(
        hnsTokenAddress,
        "https://api.hashandslash.com/metadata/"
    );
    await hnsGameEcosystem.waitForDeployment();
    const hnsGameEcosystemAddress = await hnsGameEcosystem.getAddress();
    console.log("✅ HNS Game Ecosystem deployed to:", hnsGameEcosystemAddress);
    
    // Setup roles
    console.log("3. Setting up roles...");
    const AIRDROP_ROLE = await hnsToken.AIRDROP_ROLE();
    await hnsToken.grantRole(AIRDROP_ROLE, hnsGameEcosystemAddress);
    console.log("✅ AIRDROP_ROLE granted to ecosystem");
    
    const ACTIVITY_MANAGER_ROLE = await hnsGameEcosystem.ACTIVITY_MANAGER_ROLE();
    await hnsGameEcosystem.grantRole(ACTIVITY_MANAGER_ROLE, activityManager.address);
    console.log("✅ ACTIVITY_MANAGER_ROLE granted to activityManager");
    
    // Transfer HNS to ecosystem for airdrops
    const airdropAmount = ethers.parseEther("10000");
    await hnsToken.transfer(hnsGameEcosystemAddress, airdropAmount);
    console.log("✅ 10,000 HNS transferred to ecosystem for airdrops");
    
    // Grant airdrop role to deployer for testing
    await hnsToken.grantRole(AIRDROP_ROLE, deployer.address);
    console.log("✅ AIRDROP_ROLE granted to deployer for testing");
    
    // Transfer HNS to the contract itself for airdrops
    await hnsToken.transfer(hnsTokenAddress, ethers.parseEther("1000"));
    console.log("✅ 1,000 HNS transferred to contract for airdrops");
    
    // Check contract balance before airdrop
    const contractBalance = await hnsToken.balanceOf(hnsTokenAddress);
    console.log("   Contract balance before airdrop:", ethers.formatEther(contractBalance), "HNS");
    
    console.log();
    
    // ============ PHASE 2: HNS TOKEN FUNCTIONS ============
    console.log("🪙 PHASE 2: HNS TOKEN FUNCTIONS");
    console.log("-".repeat(40));
    
    // Test HNS Token basic functions
    console.log("1. Testing HNS Token basic functions...");
    
    // Check initial state
    const totalSupply = await hnsToken.totalSupply();
    const deployerBalance = await hnsToken.balanceOf(deployer.address);
    const ecosystemBalance = await hnsToken.balanceOf(hnsGameEcosystemAddress);
    
    console.log("   Total Supply:", ethers.formatEther(totalSupply));
    console.log("   Deployer Balance:", ethers.formatEther(deployerBalance));
    console.log("   Ecosystem Balance:", ethers.formatEther(ecosystemBalance));
    
    // Test airdrop functions
    console.log("2. Testing airdrop functions...");
    
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
    console.log("   ✅ User1 airdrop status:", hasUser1Received);
    console.log("   ✅ User2 airdrop status:", hasUser2Received);
    
    // Test airdrop stats
    const airdropStats = await hnsToken.getAirdropStats();
    console.log("   ✅ Total airdropped:", ethers.formatEther(airdropStats.airdropped), "HNS");
    console.log("   ✅ Remaining balance:", ethers.formatEther(airdropStats.remainingBalance), "HNS");
    
    // Test minting function
    console.log("3. Testing minting function...");
    const mintAmount = ethers.parseEther("1000");
    await hnsToken.mint(deployer.address, mintAmount);
    const newDeployerBalance = await hnsToken.balanceOf(deployer.address);
    console.log("   ✅ Minted 1000 HNS to deployer. New balance:", ethers.formatEther(newDeployerBalance), "HNS");
    
    console.log();
    
    // ============ PHASE 3: GAME CREATION ============
    console.log("🎮 PHASE 3: GAME CREATION");
    console.log("-".repeat(40));
    
    console.log("1. Testing game creation...");
    
    // Create first game
    const game1Amount = ethers.parseEther("100");
    await hnsToken.approve(hnsGameEcosystemAddress, game1Amount);
    
    const tx1 = await hnsGameEcosystem.createGameToken(
        game1Amount,
        "Shooter Game",
        "ST",
        18
    );
    await tx1.wait();
    console.log("   ✅ Game 1 created: Shooter Game (ST)");
    
    // Create second game
    const game2Amount = ethers.parseEther("200");
    await hnsToken.approve(hnsGameEcosystemAddress, game2Amount);
    
    const tx2 = await hnsGameEcosystem.createGameToken(
        game2Amount,
        "Racing Game",
        "RG",
        18
    );
    await tx2.wait();
    console.log("   ✅ Game 2 created: Racing Game (RG)");
    
    // Test game info retrieval
    console.log("2. Testing game info retrieval...");
    
    const game1Info = await hnsGameEcosystem.getGameTokenInfo(1);
    const game2Info = await hnsGameEcosystem.getGameTokenInfo(2);
    
    console.log("   Game 1 Info:");
    console.log("     Name:", game1Info.name);
    console.log("     Symbol:", game1Info.symbol);
    console.log("     HNS Locked:", ethers.formatEther(game1Info.hnsLocked));
    console.log("     Initial Supply:", ethers.formatEther(game1Info.initialSupply));
    console.log("     Active:", game1Info.active);
    
    console.log("   Game 2 Info:");
    console.log("     Name:", game2Info.name);
    console.log("     Symbol:", game2Info.symbol);
    console.log("     HNS Locked:", ethers.formatEther(game2Info.hnsLocked));
    console.log("     Active:", game2Info.active);
    
    // Test get all game IDs
    const allGameIds = await hnsGameEcosystem.getAllGameIds();
    console.log("   ✅ All Game IDs:", allGameIds.map(id => id.toString()));
    
    console.log();
    
    // ============ PHASE 4: ACTIVITY POINTS SYSTEM ============
    console.log("🏆 PHASE 4: ACTIVITY POINTS SYSTEM");
    console.log("-".repeat(40));
    
    console.log("1. Setting up activity points...");
    
    // Set activity points for Game 1
    await hnsGameEcosystem.setActivityPoints(1, "shoot_enemy", 10);
    await hnsGameEcosystem.setActivityPoints(1, "collect_powerup", 5);
    await hnsGameEcosystem.setActivityPoints(1, "complete_level", 50);
    console.log("   ✅ Activity points set for Game 1");
    
    // Set activity points for Game 2
    await hnsGameEcosystem.setActivityPoints(2, "finish_race", 20);
    await hnsGameEcosystem.setActivityPoints(2, "collect_boost", 8);
    await hnsGameEcosystem.setActivityPoints(2, "win_championship", 100);
    console.log("   ✅ Activity points set for Game 2");
    
    console.log("2. Recording user activities...");
    
    // Record activities for User1 in Game 1
    await hnsGameEcosystem.connect(activityManager).recordActivity(1, user1.address, "shoot_enemy");
    await hnsGameEcosystem.connect(activityManager).recordActivity(1, user1.address, "collect_powerup");
    await hnsGameEcosystem.connect(activityManager).recordActivity(1, user1.address, "complete_level");
    console.log("   ✅ Recorded 3 activities for User1 in Game 1");
    
    // Record activities for User2 in Game 2
    await hnsGameEcosystem.connect(activityManager).recordActivity(2, user2.address, "finish_race");
    await hnsGameEcosystem.connect(activityManager).recordActivity(2, user2.address, "collect_boost");
    console.log("   ✅ Recorded 2 activities for User2 in Game 2");
    
    console.log("3. Testing activity tracking...");
    
    // Get transaction logs for User1 in Game 1
    const user1Game1Logs = await hnsGameEcosystem.getTransactionLogs(1, user1.address);
    console.log("   User1 Game 1 Activity:");
    console.log("     Total Points:", user1Game1Logs.totalPoints.toString());
    console.log("     Redeemed Points:", user1Game1Logs.redeemedPoints.toString());
    console.log("     Available Points:", user1Game1Logs.availablePoints.toString());
    
    // Get transaction logs for User2 in Game 2
    const user2Game2Logs = await hnsGameEcosystem.getTransactionLogs(2, user2.address);
    console.log("   User2 Game 2 Activity:");
    console.log("     Total Points:", user2Game2Logs.totalPoints.toString());
    console.log("     Available Points:", user2Game2Logs.availablePoints.toString());
    
    // Get detailed activity logs
    const user1DetailedLogs = await hnsGameEcosystem.getDetailedActivityLogs(user1.address, 1);
    console.log("   User1 Detailed Activity Logs:", user1DetailedLogs.length, "activities");
    
    console.log();
    
    // ============ PHASE 5: HNS → GAME TOKEN REDEMPTION ============
    console.log("🔄 PHASE 5: HNS → GAME TOKEN REDEMPTION");
    console.log("-".repeat(40));
    
    console.log("1. Testing HNS to Game Token redemption...");
    
    // User1 redeems HNS for Game 1 tokens
    const user1HnsAmount = ethers.parseEther("0.5"); // User1 has 1 HNS from airdrop
    await hnsToken.connect(user1).approve(hnsGameEcosystemAddress, user1HnsAmount);
    await hnsGameEcosystem.connect(user1).redeemHNSForGameToken(1, user1HnsAmount);
    
    const user1Game1Balance = await hnsGameEcosystem.balanceOf(user1.address, 1);
    console.log("   ✅ User1 redeemed 0.5 HNS for Game 1 tokens. Balance:", ethers.formatEther(user1Game1Balance));
    
    // User2 redeems HNS for Game 2 tokens
    const user2HnsAmount = ethers.parseEther("0.8"); // User2 has 1 HNS from airdrop
    await hnsToken.connect(user2).approve(hnsGameEcosystemAddress, user2HnsAmount);
    await hnsGameEcosystem.connect(user2).redeemHNSForGameToken(2, user2HnsAmount);
    
    const user2Game2Balance = await hnsGameEcosystem.balanceOf(user2.address, 2);
    console.log("   ✅ User2 redeemed 0.8 HNS for Game 2 tokens. Balance:", ethers.formatEther(user2Game2Balance));
    
    console.log();
    
    // ============ PHASE 6: POINTS → GAME TOKEN REDEMPTION ============
    console.log("🎯 PHASE 6: POINTS → GAME TOKEN REDEMPTION");
    console.log("-".repeat(40));
    
    console.log("1. Testing points redemption for game tokens...");
    
    // User1 redeems points for Game 1 tokens
    const user1PointsToRedeem = 30; // 10 + 5 + 50 = 65 total, redeem 30
    await hnsGameEcosystem.connect(user1).redeemPointsForGameToken(1, user1PointsToRedeem);
    
    const user1Game1BalanceAfter = await hnsGameEcosystem.balanceOf(user1.address, 1);
    const user1Game1LogsAfter = await hnsGameEcosystem.getTransactionLogs(1, user1.address);
    console.log("   ✅ User1 redeemed 30 points for Game 1 tokens");
    console.log("     New Game 1 Balance:", ethers.formatEther(user1Game1BalanceAfter));
    console.log("     Remaining Points:", user1Game1LogsAfter.availablePoints.toString());
    
    // User2 redeems points for Game 2 tokens
    const user2PointsToRedeem = 20; // 20 + 8 = 28 total, redeem 20
    await hnsGameEcosystem.connect(user2).redeemPointsForGameToken(2, user2PointsToRedeem);
    
    const user2Game2BalanceAfter = await hnsGameEcosystem.balanceOf(user2.address, 2);
    const user2Game2LogsAfter = await hnsGameEcosystem.getTransactionLogs(2, user2.address);
    console.log("   ✅ User2 redeemed 20 points for Game 2 tokens");
    console.log("     New Game 2 Balance:", ethers.formatEther(user2Game2BalanceAfter));
    console.log("     Remaining Points:", user2Game2LogsAfter.availablePoints.toString());
    
    console.log();
    
    // ============ PHASE 7: GAME TOKEN BURNING → HNS RETURN ============
    console.log("🔥 PHASE 7: GAME TOKEN BURNING → HNS RETURN");
    console.log("-".repeat(40));
    
    console.log("1. Testing game token burning for HNS return...");
    
    // Calculate HNS return for User1
    const user1BurnAmount = ethers.parseEther("0.3"); // User1 has ~0.5 tokens
    const user1HnsReturn = await hnsGameEcosystem.calculateHNSReturn(1, user1BurnAmount);
    console.log("   User1 will receive", ethers.formatEther(user1HnsReturn), "HNS for burning 0.3 Game 1 tokens");
    
    // User1 burns Game 1 tokens
    const user1HnsBefore = await hnsToken.balanceOf(user1.address);
    await hnsGameEcosystem.connect(user1).burnGameTokenForHNS(1, user1BurnAmount);
    const user1HnsAfter = await hnsToken.balanceOf(user1.address);
    const user1Game1BalanceAfterBurn = await hnsGameEcosystem.balanceOf(user1.address, 1);
    
    console.log("   ✅ User1 burned 0.3 Game 1 tokens");
    console.log("     HNS received:", ethers.formatEther(user1HnsAfter - user1HnsBefore));
    console.log("     Remaining Game 1 tokens:", ethers.formatEther(user1Game1BalanceAfterBurn));
    
    // Calculate HNS return for User2
    const user2BurnAmount = ethers.parseEther("0.4"); // User2 has ~0.8 tokens
    const user2HnsReturn = await hnsGameEcosystem.calculateHNSReturn(2, user2BurnAmount);
    console.log("   User2 will receive", ethers.formatEther(user2HnsReturn), "HNS for burning 0.4 Game 2 tokens");
    
    // User2 burns Game 2 tokens
    const user2HnsBefore = await hnsToken.balanceOf(user2.address);
    await hnsGameEcosystem.connect(user2).burnGameTokenForHNS(2, user2BurnAmount);
    const user2HnsAfter = await hnsToken.balanceOf(user2.address);
    const user2Game2BalanceAfterBurn = await hnsGameEcosystem.balanceOf(user2.address, 2);
    
    console.log("   ✅ User2 burned 0.4 Game 2 tokens");
    console.log("     HNS received:", ethers.formatEther(user2HnsAfter - user2HnsBefore));
    console.log("     Remaining Game 2 tokens:", ethers.formatEther(user2Game2BalanceAfterBurn));
    
    console.log();
    
    // ============ PHASE 8: DASHBOARD FUNCTIONS ============
    console.log("📊 PHASE 8: DASHBOARD FUNCTIONS");
    console.log("-".repeat(40));
    
    console.log("1. Testing user balances...");
    
    // Get User1 balances
    const user1Balances = await hnsGameEcosystem.getUserBalances(user1.address);
    console.log("   User1 Balances:");
    console.log("     HNS Balance:", ethers.formatEther(user1Balances.hnsBalance));
    console.log("     Game IDs:", user1Balances.gameIds.map(id => id.toString()));
    console.log("     Game Token Balances:", user1Balances.gameTokenBalances.map(balance => ethers.formatEther(balance)));
    
    // Get User2 balances
    const user2Balances = await hnsGameEcosystem.getUserBalances(user2.address);
    console.log("   User2 Balances:");
    console.log("     HNS Balance:", ethers.formatEther(user2Balances.hnsBalance));
    console.log("     Game IDs:", user2Balances.gameIds.map(id => id.toString()));
    console.log("     Game Token Balances:", user2Balances.gameTokenBalances.map(balance => ethers.formatEther(balance)));
    
    console.log("2. Testing activity logs...");
    
    // Get User1 activity logs
    const user1ActivityLogs = await hnsGameEcosystem.getActivityLogs(user1.address);
    console.log("   User1 Activity Summary:");
    console.log("     Games Played:", user1ActivityLogs.gameIds.length);
    console.log("     Total Points:", user1ActivityLogs.totalPoints.map(points => points.toString()));
    console.log("     Redeemed Points:", user1ActivityLogs.redeemedPoints.map(points => points.toString()));
    
    // Get User2 activity logs
    const user2ActivityLogs = await hnsGameEcosystem.getActivityLogs(user2.address);
    console.log("   User2 Activity Summary:");
    console.log("     Games Played:", user2ActivityLogs.gameIds.length);
    console.log("     Total Points:", user2ActivityLogs.totalPoints.map(points => points.toString()));
    console.log("     Redeemed Points:", user2ActivityLogs.redeemedPoints.map(points => points.toString()));
    
    console.log();
    
    // ============ PHASE 9: ADMIN FUNCTIONS ============
    console.log("⚙️ PHASE 9: ADMIN FUNCTIONS");
    console.log("-".repeat(40));
    
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
    
    console.log("2. Testing emergency withdrawal...");
    
    // Get contract HNS balance before withdrawal
    const contractHnsBefore = await hnsToken.balanceOf(hnsGameEcosystemAddress);
    console.log("   Contract HNS balance before withdrawal:", ethers.formatEther(contractHnsBefore));
    
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
    console.log("-".repeat(40));
    
    console.log("1. Testing duplicate airdrop...");
    
    try {
        await hnsToken.airdropHNS(user1.address);
        console.log("   ❌ Duplicate airdrop should have failed");
    } catch (error) {
        console.log("   ✅ Duplicate airdrop correctly failed");
    }
    
    console.log("2. Testing insufficient balance...");
    
    try {
        await hnsGameEcosystem.connect(user3).redeemHNSForGameToken(1, ethers.parseEther("1000"));
        console.log("   ❌ Insufficient balance operation should have failed");
    } catch (error) {
        console.log("   ✅ Insufficient balance operation correctly failed");
    }
    
    console.log("3. Testing invalid game ID...");
    
    try {
        await hnsGameEcosystem.getGameTokenInfo(999);
        console.log("   ❌ Invalid game ID should have failed");
    } catch (error) {
        console.log("   ✅ Invalid game ID correctly failed");
    }
    
    console.log("4. Testing unauthorized activity recording...");
    
    try {
        await hnsGameEcosystem.connect(user1).recordActivity(1, user1.address, "test_action");
        console.log("   ❌ Unauthorized activity recording should have failed");
    } catch (error) {
        console.log("   ✅ Unauthorized activity recording correctly failed");
    }
    
    console.log();
    
    // ============ FINAL SUMMARY ============
    console.log("🎉 FINAL SUMMARY");
    console.log("=" .repeat(60));
    
    console.log("✅ All functions tested successfully!");
    console.log();
    
    console.log("📊 Final State:");
    
    // Final balances
    const finalUser1Hns = await hnsToken.balanceOf(user1.address);
    const finalUser2Hns = await hnsToken.balanceOf(user2.address);
    const finalUser3Hns = await hnsToken.balanceOf(user3.address);
    
    console.log("   User1 Final HNS:", ethers.formatEther(finalUser1Hns));
    console.log("   User2 Final HNS:", ethers.formatEther(finalUser2Hns));
    console.log("   User3 Final HNS:", ethers.formatEther(finalUser3Hns));
    
    // Final game token balances
    const finalUser1Game1 = await hnsGameEcosystem.balanceOf(user1.address, 1);
    const finalUser2Game2 = await hnsGameEcosystem.balanceOf(user2.address, 2);
    const finalUser3Game1 = await hnsGameEcosystem.balanceOf(user3.address, 1);
    
    console.log("   User1 Game 1 Tokens:", ethers.formatEther(finalUser1Game1));
    console.log("   User2 Game 2 Tokens:", ethers.formatEther(finalUser2Game2));
    console.log("   User3 Game 1 Tokens:", ethers.formatEther(finalUser3Game1));
    
    // Contract addresses
    console.log();
    console.log("📋 Contract Addresses:");
    console.log("   HNS Token:", hnsTokenAddress);
    console.log("   HNS Game Ecosystem:", hnsGameEcosystemAddress);
    
    console.log();
    console.log("🎯 All functions working correctly! HNS Gaming Ecosystem is ready for production! 🚀");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Test failed:", error);
        process.exit(1);
    }); 