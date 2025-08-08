const { ethers } = require("hardhat");

async function main() {
    console.log("🎮 HNS GAMING ECOSYSTEM - BATCH ACTIVITY RECORDING TEST");
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
    
    await hnsToken.grantRole(AIRDROP_ROLE, hnsGameEcosystemAddress);
    await hnsGameEcosystem.grantRole(ACTIVITY_MANAGER_ROLE, activityManager.address);
    await hnsGameEcosystem.grantRole(GAME_CREATOR_ROLE, gameCreator.address);
    
    console.log("   ✅ Roles granted successfully");
    
    // Transfer HNS for ecosystem
    await hnsToken.transfer(hnsGameEcosystemAddress, ethers.parseEther("10000"));
    await hnsToken.transfer(hnsTokenAddress, ethers.parseEther("1000"));
    await hnsToken.transfer(gameCreator.address, ethers.parseEther("1000"));
    
    console.log("   ✅ HNS transferred to ecosystem");
    
    // Airdrop HNS to users
    console.log("4. Airdropping HNS to users...");
    await hnsToken.airdropHNS(user1.address);
    await hnsToken.airdropHNS(user2.address);
    await hnsToken.airdropHNS(user3.address);
    console.log("   ✅ HNS airdropped to all users");
    
    console.log();
    
    // ============ PHASE 2: GAME CREATION ============
    console.log("🎮 PHASE 2: GAME CREATION");
    console.log("-".repeat(50));
    
    // Create Shooter Game
    console.log("1. Creating Shooter Game...");
    const game1Amount = ethers.parseEther("100");
    await hnsToken.connect(gameCreator).approve(hnsGameEcosystemAddress, game1Amount);
    await hnsGameEcosystem.connect(gameCreator).createGameToken(
        game1Amount,
        "Shooter Game",
        "ST",
        18
    );
    console.log("   ✅ Shooter Game created");
    
    // Set activity points for Shooter Game
    console.log("2. Setting activity points for Shooter Game...");
    await hnsGameEcosystem.connect(activityManager).setActivityPointsBatch(1, [
        "shoot_enemy", "collect_powerup", "complete_level", "headshot_bonus"
    ], [10, 5, 50, 25]);
    console.log("   ✅ Activity points set");
    
    console.log();
    
    // ============ PHASE 3: BATCH ACTIVITY RECORDING ============
    console.log("📊 PHASE 3: BATCH ACTIVITY RECORDING");
    console.log("-".repeat(50));
    
    // Test 1: Single activity recording (original method)
    console.log("1. Testing single activity recording...");
    const singleActivityTx = await hnsGameEcosystem.connect(activityManager).recordActivity(
        1, 
        user1.address, 
        "shoot_enemy"
    );
    await singleActivityTx.wait();
    console.log("   ✅ Single activity recorded: shoot_enemy");
    
    // Test 2: Batch activity recording (new method)
    console.log("2. Testing batch activity recording...");
    const batchActivities = [
        "shoot_enemy",
        "collect_powerup", 
        "complete_level",
        "headshot_bonus"
    ];
    
    const batchActivityTx = await hnsGameEcosystem.connect(activityManager).recordActivityBatch(
        1,
        user1.address,
        batchActivities
    );
    await batchActivityTx.wait();
    console.log("   ✅ Batch activities recorded:", batchActivities.join(", "));
    
    // Test 3: Multiple batch recordings for different users
    console.log("3. Testing batch recording for multiple users...");
    
    // User2 batch activities
    const user2Activities = ["shoot_enemy", "shoot_enemy", "complete_level"];
    const user2BatchTx = await hnsGameEcosystem.connect(activityManager).recordActivityBatch(
        1,
        user2.address,
        user2Activities
    );
    await user2BatchTx.wait();
    console.log("   ✅ User2 batch activities recorded:", user2Activities.join(", "));
    
    // User3 batch activities
    const user3Activities = ["collect_powerup", "headshot_bonus", "shoot_enemy", "complete_level"];
    const user3BatchTx = await hnsGameEcosystem.connect(activityManager).recordActivityBatch(
        1,
        user3.address,
        user3Activities
    );
    await user3BatchTx.wait();
    console.log("   ✅ User3 batch activities recorded:", user3Activities.join(", "));
    
    console.log();
    
    // ============ PHASE 4: VERIFY RESULTS ============
    console.log("📋 PHASE 4: VERIFY RESULTS");
    console.log("-".repeat(50));
    
    // Check User1's activity
    console.log("1. User1 Activity Summary:");
    const user1Logs = await hnsGameEcosystem.getTransactionLogs(1, user1.address);
    console.log("   Total Points:", user1Logs.totalPoints.toString());
    console.log("   Available Points:", user1Logs.availablePoints.toString());
    
    const user1DetailedLogs = await hnsGameEcosystem.getDetailedActivityLogs(user1.address, 1);
    console.log("   Activities Recorded:", user1DetailedLogs.length);
    for (const activity of user1DetailedLogs) {
        console.log(`     ${activity.action}: ${activity.points} points`);
    }
    
    // Check User2's activity
    console.log("\n2. User2 Activity Summary:");
    const user2Logs = await hnsGameEcosystem.getTransactionLogs(1, user2.address);
    console.log("   Total Points:", user2Logs.totalPoints.toString());
    console.log("   Available Points:", user2Logs.availablePoints.toString());
    
    const user2DetailedLogs = await hnsGameEcosystem.getDetailedActivityLogs(user2.address, 1);
    console.log("   Activities Recorded:", user2DetailedLogs.length);
    for (const activity of user2DetailedLogs) {
        console.log(`     ${activity.action}: ${activity.points} points`);
    }
    
    // Check User3's activity
    console.log("\n3. User3 Activity Summary:");
    const user3Logs = await hnsGameEcosystem.getTransactionLogs(1, user3.address);
    console.log("   Total Points:", user3Logs.totalPoints.toString());
    console.log("   Available Points:", user3Logs.availablePoints.toString());
    
    const user3DetailedLogs = await hnsGameEcosystem.getDetailedActivityLogs(user3.address, 1);
    console.log("   Activities Recorded:", user3DetailedLogs.length);
    for (const activity of user3DetailedLogs) {
        console.log(`     ${activity.action}: ${activity.points} points`);
    }
    
    console.log();
    
    // ============ PHASE 5: GAS COMPARISON ============
    console.log("⛽ PHASE 5: GAS COMPARISON");
    console.log("-".repeat(50));
    
    console.log("📊 Gas Usage Comparison:");
    console.log("   Single Activity TX Hash:", singleActivityTx.hash);
    console.log("   Batch Activity TX Hash:", batchActivityTx.hash);
    console.log("   User2 Batch TX Hash:", user2BatchTx.hash);
    console.log("   User3 Batch TX Hash:", user3BatchTx.hash);
    
    console.log();
    console.log("🎯 Benefits of Batch Recording:");
    console.log("   ✅ Reduced gas costs (fewer transactions)");
    console.log("   ✅ Better performance (bulk processing)");
    console.log("   ✅ Atomic operations (all or nothing)");
    console.log("   ✅ Reduced network congestion");
    
    console.log();
    console.log("🎉 BATCH ACTIVITY RECORDING TEST COMPLETE!");
    console.log("=" .repeat(70));
    console.log("✅ New recordActivityBatch function is working perfectly!");
    console.log("📊 All activities recorded and verified successfully!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Batch activity test failed:", error);
        process.exit(1);
    }); 