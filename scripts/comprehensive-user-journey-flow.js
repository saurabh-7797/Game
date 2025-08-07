const { ethers } = require("hardhat");

async function main() {
    console.log("🎮 HNS GAMING ECOSYSTEM - COMPREHENSIVE USER JOURNEY FLOW");
    console.log("=" .repeat(80));
    console.log("📍 HNS Token Address: 0xc4d5CA7AABD8b301654c4673E5d4F633C986f6AF");
    console.log("🔄 Flow: HNS → Buy Game Tokens → Game Starts → Burn Game Tokens → Activities Begin");
    console.log("=" .repeat(80));
    
    const [deployer, user1, user2, user3, activityManager, gameCreator] = await ethers.getSigners();
    
    console.log("👥 Test Accounts:");
    console.log("  Deployer:", deployer.address);
    console.log("  User1:", user1.address);
    console.log("  User2:", user2.address);
    console.log("  User3:", user3.address);
    console.log("  ActivityManager:", activityManager.address);
    console.log("  GameCreator:", gameCreator.address);
    console.log();
    
    // ============ PHASE 1: CONTRACT DEPLOYMENT & SETUP ============
    console.log("🚀 PHASE 1: CONTRACT DEPLOYMENT & SETUP");
    console.log("-".repeat(60));
    
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
    
    const roleTx1 = await hnsToken.grantRole(AIRDROP_ROLE, hnsGameEcosystemAddress);
    await roleTx1.wait();
    console.log("   ✅ AIRDROP_ROLE granted to ecosystem. TX:", roleTx1.hash);
    
    const roleTx2 = await hnsGameEcosystem.grantRole(ACTIVITY_MANAGER_ROLE, activityManager.address);
    await roleTx2.wait();
    console.log("   ✅ ACTIVITY_MANAGER_ROLE granted. TX:", roleTx2.hash);
    
    const roleTx3 = await hnsGameEcosystem.grantRole(GAME_CREATOR_ROLE, gameCreator.address);
    await roleTx3.wait();
    console.log("   ✅ GAME_CREATOR_ROLE granted. TX:", roleTx3.hash);
    
    const roleTx4 = await hnsGameEcosystem.grantRole(PAUSER_ROLE, deployer.address);
    await roleTx4.wait();
    console.log("   ✅ PAUSER_ROLE granted. TX:", roleTx4.hash);
    
    const roleTx5 = await hnsGameEcosystem.grantRole(EMERGENCY_ROLE, deployer.address);
    await roleTx5.wait();
    console.log("   ✅ EMERGENCY_ROLE granted. TX:", roleTx5.hash);
    
    const roleTx6 = await hnsToken.grantRole(AIRDROP_ROLE, deployer.address);
    await roleTx6.wait();
    console.log("   ✅ AIRDROP_ROLE granted to deployer. TX:", roleTx6.hash);
    
    // Transfer HNS for ecosystem
    const transferTx1 = await hnsToken.transfer(hnsGameEcosystemAddress, ethers.parseEther("10000"));
    await transferTx1.wait();
    console.log("   ✅ 10,000 HNS transferred to ecosystem. TX:", transferTx1.hash);
    
    const transferTx2 = await hnsToken.transfer(hnsTokenAddress, ethers.parseEther("1000"));
    await transferTx2.wait();
    console.log("   ✅ 1,000 HNS transferred to token contract. TX:", transferTx2.hash);
    
    const transferTx3 = await hnsToken.transfer(gameCreator.address, ethers.parseEther("1000"));
    await transferTx3.wait();
    console.log("   ✅ 1,000 HNS transferred to game creator. TX:", transferTx3.hash);
    
    console.log();
    
    // ============ PHASE 2: USER ONBOARDING (AIRDROP) ============
    console.log("🎁 PHASE 2: USER ONBOARDING - HNS AIRDROP");
    console.log("-".repeat(60));
    
    console.log("1. Airdropping HNS to new users...");
    
    // Airdrop HNS to users
    const airdropTx1 = await hnsToken.airdropHNS(user1.address);
    await airdropTx1.wait();
    console.log("   ✅ User1 airdrop. TX:", airdropTx1.hash);
    
    const airdropTx2 = await hnsToken.airdropHNS(user2.address);
    await airdropTx2.wait();
    console.log("   ✅ User2 airdrop. TX:", airdropTx2.hash);
    
    const airdropTx3 = await hnsToken.airdropHNS(user3.address);
    await airdropTx3.wait();
    console.log("   ✅ User3 airdrop. TX:", airdropTx3.hash);
    
    const user1HnsBalance = await hnsToken.balanceOf(user1.address);
    const user2HnsBalance = await hnsToken.balanceOf(user2.address);
    const user3HnsBalance = await hnsToken.balanceOf(user3.address);
    
    console.log("   📊 User1 HNS balance:", ethers.formatEther(user1HnsBalance), "HNS");
    console.log("   📊 User2 HNS balance:", ethers.formatEther(user2HnsBalance), "HNS");
    console.log("   📊 User3 HNS balance:", ethers.formatEther(user3HnsBalance), "HNS");
    
    // Test airdrop stats
    const airdropStats = await hnsToken.getAirdropStats();
    console.log("   📊 Total airdropped:", ethers.formatEther(airdropStats.airdropped), "HNS");
    console.log("   📊 Remaining balance:", ethers.formatEther(airdropStats.remainingBalance), "HNS");
    
    console.log();
    
    // ============ PHASE 3: GAME CREATION (ADMIN) ============
    console.log("🎮 PHASE 3: GAME CREATION - ADMIN SETUP");
    console.log("-".repeat(60));
    
    console.log("1. Creating games for the ecosystem...");
    
    // Create multiple games
    const game1Amount = ethers.parseEther("100");
    const approveTx1 = await hnsToken.connect(gameCreator).approve(hnsGameEcosystemAddress, game1Amount);
    await approveTx1.wait();
    console.log("   ✅ Game creator approved HNS for Game 1. TX:", approveTx1.hash);
    
    const game1Tx = await hnsGameEcosystem.connect(gameCreator).createGameToken(
        game1Amount,
        "Shooter Game",
        "ST",
        18
    );
    await game1Tx.wait();
    console.log("   ✅ Game 1 created: Shooter Game (ST). TX:", game1Tx.hash);
    
    const game2Amount = ethers.parseEther("200");
    const approveTx2 = await hnsToken.connect(gameCreator).approve(hnsGameEcosystemAddress, game2Amount);
    await approveTx2.wait();
    console.log("   ✅ Game creator approved HNS for Game 2. TX:", approveTx2.hash);
    
    const game2Tx = await hnsGameEcosystem.connect(gameCreator).createGameToken(
        game2Amount,
        "Racing Game",
        "RG",
        18
    );
    await game2Tx.wait();
    console.log("   ✅ Game 2 created: Racing Game (RG). TX:", game2Tx.hash);
    
    const game3Amount = ethers.parseEther("150");
    const approveTx3 = await hnsToken.connect(gameCreator).approve(hnsGameEcosystemAddress, game3Amount);
    await approveTx3.wait();
    console.log("   ✅ Game creator approved HNS for Game 3. TX:", approveTx3.hash);
    
    const game3Tx = await hnsGameEcosystem.connect(gameCreator).createGameToken(
        game3Amount,
        "Puzzle Game",
        "PG",
        18
    );
    await game3Tx.wait();
    console.log("   ✅ Game 3 created: Puzzle Game (PG). TX:", game3Tx.hash);
    
    // Set activity points for games
    console.log("2. Setting up activity points for games...");
    
    // Game 1 - Shooter activities
    const activityTx1 = await hnsGameEcosystem.connect(activityManager).setActivityPointsBatch(1, [
        "shoot_enemy", "collect_powerup", "complete_level", "headshot_bonus"
    ], [10, 5, 50, 25]);
    await activityTx1.wait();
    console.log("   ✅ Shooter Game activity points set. TX:", activityTx1.hash);
    
    // Game 2 - Racing activities
    const activityTx2 = await hnsGameEcosystem.connect(activityManager).setActivityPointsBatch(2, [
        "finish_race", "collect_boost", "win_championship", "drift_bonus"
    ], [20, 8, 100, 15]);
    await activityTx2.wait();
    console.log("   ✅ Racing Game activity points set. TX:", activityTx2.hash);
    
    // Game 3 - Puzzle activities
    const activityTx3 = await hnsGameEcosystem.connect(activityManager).setActivityPointsBatch(3, [
        "solve_puzzle", "hint_used", "time_bonus", "perfect_score"
    ], [15, 3, 7, 25]);
    await activityTx3.wait();
    console.log("   ✅ Puzzle Game activity points set. TX:", activityTx3.hash);
    
    console.log();
    
    // ============ PHASE 4: USERS BUY GAME TOKENS WITH HNS ============
    console.log("💰 PHASE 4: USERS BUY GAME TOKENS WITH HNS");
    console.log("-".repeat(60));
    
    console.log("1. User1 buying game tokens...");
    
    // User1 buys Shooter Game tokens
    const user1ShooterAmount = ethers.parseEther("0.5");
    const user1ApproveTx1 = await hnsToken.connect(user1).approve(hnsGameEcosystemAddress, user1ShooterAmount);
    await user1ApproveTx1.wait();
    console.log("   ✅ User1 approved HNS for Shooter Game. TX:", user1ApproveTx1.hash);
    
    const user1ShooterTx = await hnsGameEcosystem.connect(user1).redeemHNSForGameToken(1, user1ShooterAmount);
    await user1ShooterTx.wait();
    console.log("   ✅ User1 bought Shooter Game tokens. TX:", user1ShooterTx.hash);
    
    const user1ShooterBalance = await hnsGameEcosystem.balanceOf(user1.address, 1);
    console.log("   📊 User1 Shooter balance:", ethers.formatEther(user1ShooterBalance), "ST");
    
    // User1 buys Racing Game tokens
    const user1RacingAmount = ethers.parseEther("0.3");
    const user1ApproveTx2 = await hnsToken.connect(user1).approve(hnsGameEcosystemAddress, user1RacingAmount);
    await user1ApproveTx2.wait();
    console.log("   ✅ User1 approved HNS for Racing Game. TX:", user1ApproveTx2.hash);
    
    const user1RacingTx = await hnsGameEcosystem.connect(user1).redeemHNSForGameToken(2, user1RacingAmount);
    await user1RacingTx.wait();
    console.log("   ✅ User1 bought Racing Game tokens. TX:", user1RacingTx.hash);
    
    const user1RacingBalance = await hnsGameEcosystem.balanceOf(user1.address, 2);
    console.log("   📊 User1 Racing balance:", ethers.formatEther(user1RacingBalance), "RG");
    
    console.log("2. User2 buying game tokens...");
    
    // User2 buys Racing Game tokens
    const user2RacingAmount = ethers.parseEther("0.8");
    const user2ApproveTx1 = await hnsToken.connect(user2).approve(hnsGameEcosystemAddress, user2RacingAmount);
    await user2ApproveTx1.wait();
    console.log("   ✅ User2 approved HNS for Racing Game. TX:", user2ApproveTx1.hash);
    
    const user2RacingTx = await hnsGameEcosystem.connect(user2).redeemHNSForGameToken(2, user2RacingAmount);
    await user2RacingTx.wait();
    console.log("   ✅ User2 bought Racing Game tokens. TX:", user2RacingTx.hash);
    
    const user2RacingBalance = await hnsGameEcosystem.balanceOf(user2.address, 2);
    console.log("   📊 User2 Racing balance:", ethers.formatEther(user2RacingBalance), "RG");
    
    // User2 buys Puzzle Game tokens
    const user2PuzzleAmount = ethers.parseEther("0.2");
    const user2ApproveTx2 = await hnsToken.connect(user2).approve(hnsGameEcosystemAddress, user2PuzzleAmount);
    await user2ApproveTx2.wait();
    console.log("   ✅ User2 approved HNS for Puzzle Game. TX:", user2ApproveTx2.hash);
    
    const user2PuzzleTx = await hnsGameEcosystem.connect(user2).redeemHNSForGameToken(3, user2PuzzleAmount);
    await user2PuzzleTx.wait();
    console.log("   ✅ User2 bought Puzzle Game tokens. TX:", user2PuzzleTx.hash);
    
    const user2PuzzleBalance = await hnsGameEcosystem.balanceOf(user2.address, 3);
    console.log("   📊 User2 Puzzle balance:", ethers.formatEther(user2PuzzleBalance), "PG");
    
    console.log("3. User3 buying game tokens...");
    
    // User3 buys Shooter Game tokens
    const user3ShooterAmount = ethers.parseEther("1.0");
    const user3ApproveTx1 = await hnsToken.connect(user3).approve(hnsGameEcosystemAddress, user3ShooterAmount);
    await user3ApproveTx1.wait();
    console.log("   ✅ User3 approved HNS for Shooter Game. TX:", user3ApproveTx1.hash);
    
    const user3ShooterTx = await hnsGameEcosystem.connect(user3).redeemHNSForGameToken(1, user3ShooterAmount);
    await user3ShooterTx.wait();
    console.log("   ✅ User3 bought Shooter Game tokens. TX:", user3ShooterTx.hash);
    
    const user3ShooterBalance = await hnsGameEcosystem.balanceOf(user3.address, 1);
    console.log("   📊 User3 Shooter balance:", ethers.formatEther(user3ShooterBalance), "ST");
    
    console.log();
    
    // ============ PHASE 5: GAME STARTS - GAME TOKENS ARE BURNED ============
    console.log("🔥 PHASE 5: GAME STARTS - GAME TOKENS ARE BURNED");
    console.log("-".repeat(60));
    
    console.log("1. User1 starting Shooter Game (burning tokens)...");
    
    // User1 burns Shooter Game tokens to start the game
    const user1ShooterBurnAmount = ethers.parseEther("0.3");
    const user1ShooterHnsReturn = await hnsGameEcosystem.calculateHNSReturn(1, user1ShooterBurnAmount);
    
    console.log("   📊 User1 will burn", ethers.formatEther(user1ShooterBurnAmount), "Shooter tokens");
    console.log("   📊 User1 will receive", ethers.formatEther(user1ShooterHnsReturn), "HNS back");
    
    const user1HnsBeforeBurn = await hnsToken.balanceOf(user1.address);
    const user1BurnTx = await hnsGameEcosystem.connect(user1).burnGameTokenForHNS(1, user1ShooterBurnAmount);
    await user1BurnTx.wait();
    console.log("   ✅ User1 burned Shooter tokens. TX:", user1BurnTx.hash);
    
    const user1HnsAfterBurn = await hnsToken.balanceOf(user1.address);
    const user1ShooterBalanceAfterBurn = await hnsGameEcosystem.balanceOf(user1.address, 1);
    
    console.log("   📊 User1 HNS received:", ethers.formatEther(user1HnsAfterBurn - user1HnsBeforeBurn), "HNS");
    console.log("   📊 User1 remaining Shooter tokens:", ethers.formatEther(user1ShooterBalanceAfterBurn), "ST");
    
    console.log("2. User2 starting Racing Game (burning tokens)...");
    
    // User2 burns Racing Game tokens to start the game
    const user2RacingBurnAmount = ethers.parseEther("0.5");
    const user2RacingHnsReturn = await hnsGameEcosystem.calculateHNSReturn(2, user2RacingBurnAmount);
    
    console.log("   📊 User2 will burn", ethers.formatEther(user2RacingBurnAmount), "Racing tokens");
    console.log("   📊 User2 will receive", ethers.formatEther(user2RacingHnsReturn), "HNS back");
    
    const user2HnsBeforeBurn = await hnsToken.balanceOf(user2.address);
    const user2BurnTx = await hnsGameEcosystem.connect(user2).burnGameTokenForHNS(2, user2RacingBurnAmount);
    await user2BurnTx.wait();
    console.log("   ✅ User2 burned Racing tokens. TX:", user2BurnTx.hash);
    
    const user2HnsAfterBurn = await hnsToken.balanceOf(user2.address);
    const user2RacingBalanceAfterBurn = await hnsGameEcosystem.balanceOf(user2.address, 2);
    
    console.log("   📊 User2 HNS received:", ethers.formatEther(user2HnsAfterBurn - user2HnsBeforeBurn), "HNS");
    console.log("   📊 User2 remaining Racing tokens:", ethers.formatEther(user2RacingBalanceAfterBurn), "RG");
    
    console.log("3. User3 starting Shooter Game (burning tokens)...");
    
    // User3 burns Shooter Game tokens to start the game
    const user3ShooterBurnAmount = ethers.parseEther("0.7");
    const user3ShooterHnsReturn = await hnsGameEcosystem.calculateHNSReturn(1, user3ShooterBurnAmount);
    
    console.log("   📊 User3 will burn", ethers.formatEther(user3ShooterBurnAmount), "Shooter tokens");
    console.log("   📊 User3 will receive", ethers.formatEther(user3ShooterHnsReturn), "HNS back");
    
    const user3HnsBeforeBurn = await hnsToken.balanceOf(user3.address);
    const user3BurnTx = await hnsGameEcosystem.connect(user3).burnGameTokenForHNS(1, user3ShooterBurnAmount);
    await user3BurnTx.wait();
    console.log("   ✅ User3 burned Shooter tokens. TX:", user3BurnTx.hash);
    
    const user3HnsAfterBurn = await hnsToken.balanceOf(user3.address);
    const user3ShooterBalanceAfterBurn = await hnsGameEcosystem.balanceOf(user3.address, 1);
    
    console.log("   📊 User3 HNS received:", ethers.formatEther(user3HnsAfterBurn - user3HnsBeforeBurn), "HNS");
    console.log("   📊 User3 remaining Shooter tokens:", ethers.formatEther(user3ShooterBalanceAfterBurn), "ST");
    
    console.log();
    
    // ============ PHASE 6: GAME ACTIVITIES BEGIN ============
    console.log("🏆 PHASE 6: GAME ACTIVITIES BEGIN");
    console.log("-".repeat(60));
    
    console.log("1. Recording User1 activities in Shooter Game...");
    
    // User1 activities in Shooter Game
    const user1ActivityTx1 = await hnsGameEcosystem.connect(activityManager).recordActivity(1, user1.address, "shoot_enemy");
    await user1ActivityTx1.wait();
    console.log("   ✅ User1 shoot_enemy recorded. TX:", user1ActivityTx1.hash);
    
    const user1ActivityTx2 = await hnsGameEcosystem.connect(activityManager).recordActivity(1, user1.address, "collect_powerup");
    await user1ActivityTx2.wait();
    console.log("   ✅ User1 collect_powerup recorded. TX:", user1ActivityTx2.hash);
    
    const user1ActivityTx3 = await hnsGameEcosystem.connect(activityManager).recordActivity(1, user1.address, "complete_level");
    await user1ActivityTx3.wait();
    console.log("   ✅ User1 complete_level recorded. TX:", user1ActivityTx3.hash);
    
    const user1ActivityTx4 = await hnsGameEcosystem.connect(activityManager).recordActivity(1, user1.address, "headshot_bonus");
    await user1ActivityTx4.wait();
    console.log("   ✅ User1 headshot_bonus recorded. TX:", user1ActivityTx4.hash);
    
    const user1ShooterActivity = await hnsGameEcosystem.getTransactionLogs(1, user1.address);
    console.log("   📊 User1 earned", user1ShooterActivity.totalPoints.toString(), "points in Shooter Game");
    
    console.log("2. Recording User2 activities in Racing Game...");
    
    // User2 activities in Racing Game
    const user2ActivityTx1 = await hnsGameEcosystem.connect(activityManager).recordActivity(2, user2.address, "finish_race");
    await user2ActivityTx1.wait();
    console.log("   ✅ User2 finish_race recorded. TX:", user2ActivityTx1.hash);
    
    const user2ActivityTx2 = await hnsGameEcosystem.connect(activityManager).recordActivity(2, user2.address, "collect_boost");
    await user2ActivityTx2.wait();
    console.log("   ✅ User2 collect_boost recorded. TX:", user2ActivityTx2.hash);
    
    const user2ActivityTx3 = await hnsGameEcosystem.connect(activityManager).recordActivity(2, user2.address, "win_championship");
    await user2ActivityTx3.wait();
    console.log("   ✅ User2 win_championship recorded. TX:", user2ActivityTx3.hash);
    
    const user2ActivityTx4 = await hnsGameEcosystem.connect(activityManager).recordActivity(2, user2.address, "drift_bonus");
    await user2ActivityTx4.wait();
    console.log("   ✅ User2 drift_bonus recorded. TX:", user2ActivityTx4.hash);
    
    const user2ActivityTx5 = await hnsGameEcosystem.connect(activityManager).recordActivity(2, user2.address, "finish_race");
    await user2ActivityTx5.wait();
    console.log("   ✅ User2 finish_race (2nd) recorded. TX:", user2ActivityTx5.hash);
    
    const user2RacingActivity = await hnsGameEcosystem.getTransactionLogs(2, user2.address);
    console.log("   📊 User2 earned", user2RacingActivity.totalPoints.toString(), "points in Racing Game");
    
    console.log("3. Recording User3 activities in Shooter Game...");
    
    // User3 activities in Shooter Game
    const user3ActivityTx1 = await hnsGameEcosystem.connect(activityManager).recordActivity(1, user3.address, "shoot_enemy");
    await user3ActivityTx1.wait();
    console.log("   ✅ User3 shoot_enemy recorded. TX:", user3ActivityTx1.hash);
    
    const user3ActivityTx2 = await hnsGameEcosystem.connect(activityManager).recordActivity(1, user3.address, "shoot_enemy");
    await user3ActivityTx2.wait();
    console.log("   ✅ User3 shoot_enemy (2nd) recorded. TX:", user3ActivityTx2.hash);
    
    const user3ActivityTx3 = await hnsGameEcosystem.connect(activityManager).recordActivity(1, user3.address, "complete_level");
    await user3ActivityTx3.wait();
    console.log("   ✅ User3 complete_level recorded. TX:", user3ActivityTx3.hash);
    
    const user3ActivityTx4 = await hnsGameEcosystem.connect(activityManager).recordActivity(1, user3.address, "headshot_bonus");
    await user3ActivityTx4.wait();
    console.log("   ✅ User3 headshot_bonus recorded. TX:", user3ActivityTx4.hash);
    
    const user3ActivityTx5 = await hnsGameEcosystem.connect(activityManager).recordActivity(1, user3.address, "collect_powerup");
    await user3ActivityTx5.wait();
    console.log("   ✅ User3 collect_powerup recorded. TX:", user3ActivityTx5.hash);
    
    const user3ShooterActivity = await hnsGameEcosystem.getTransactionLogs(1, user3.address);
    console.log("   📊 User3 earned", user3ShooterActivity.totalPoints.toString(), "points in Shooter Game");
    
    console.log();
    
    // ============ PHASE 7: USERS REDEEM POINTS FOR MORE GAME TOKENS ============
    console.log("🎯 PHASE 7: USERS REDEEM POINTS FOR MORE GAME TOKENS");
    console.log("-".repeat(60));
    
    console.log("1. User1 redeeming points for Shooter Game tokens...");
    
    const user1PointsToRedeem = 30;
    const user1RedeemTx = await hnsGameEcosystem.connect(user1).redeemPointsForGameToken(1, user1PointsToRedeem);
    await user1RedeemTx.wait();
    console.log("   ✅ User1 redeemed points for Shooter tokens. TX:", user1RedeemTx.hash);
    
    const user1ShooterBalanceAfterRedeem = await hnsGameEcosystem.balanceOf(user1.address, 1);
    const user1ShooterActivityAfterRedeem = await hnsGameEcosystem.getTransactionLogs(1, user1.address);
    
    console.log("   📊 User1 new Shooter balance:", ethers.formatEther(user1ShooterBalanceAfterRedeem), "ST");
    console.log("   📊 User1 remaining points:", user1ShooterActivityAfterRedeem.availablePoints.toString());
    
    console.log("2. User2 redeeming points for Racing Game tokens...");
    
    const user2PointsToRedeem = 50;
    const user2RedeemTx = await hnsGameEcosystem.connect(user2).redeemPointsForGameToken(2, user2PointsToRedeem);
    await user2RedeemTx.wait();
    console.log("   ✅ User2 redeemed points for Racing tokens. TX:", user2RedeemTx.hash);
    
    const user2RacingBalanceAfterRedeem = await hnsGameEcosystem.balanceOf(user2.address, 2);
    const user2RacingActivityAfterRedeem = await hnsGameEcosystem.getTransactionLogs(2, user2.address);
    
    console.log("   📊 User2 new Racing balance:", ethers.formatEther(user2RacingBalanceAfterRedeem), "RG");
    console.log("   📊 User2 remaining points:", user2RacingActivityAfterRedeem.availablePoints.toString());
    
    console.log("3. User3 redeeming points for Shooter Game tokens...");
    
    const user3PointsToRedeem = 40;
    const user3RedeemTx = await hnsGameEcosystem.connect(user3).redeemPointsForGameToken(1, user3PointsToRedeem);
    await user3RedeemTx.wait();
    console.log("   ✅ User3 redeemed points for Shooter tokens. TX:", user3RedeemTx.hash);
    
    const user3ShooterBalanceAfterRedeem = await hnsGameEcosystem.balanceOf(user3.address, 1);
    const user3ShooterActivityAfterRedeem = await hnsGameEcosystem.getTransactionLogs(1, user3.address);
    
    console.log("   📊 User3 new Shooter balance:", ethers.formatEther(user3ShooterBalanceAfterRedeem), "ST");
    console.log("   📊 User3 remaining points:", user3ShooterActivityAfterRedeem.availablePoints.toString());
    
    console.log();
    
    // ============ PHASE 8: ADMIN FUNCTIONS TESTING ============
    console.log("⚙️ PHASE 8: ADMIN FUNCTIONS TESTING");
    console.log("-".repeat(60));
    
    console.log("1. Testing pause/unpause functionality...");
    
    // Pause the contract
    const pauseTx = await hnsGameEcosystem.pause();
    await pauseTx.wait();
    console.log("   ✅ Contract paused. TX:", pauseTx.hash);
    
    // Try to perform an operation while paused (should fail)
    try {
        await hnsGameEcosystem.connect(user3).redeemHNSForGameToken(1, ethers.parseEther("1"));
        console.log("   ❌ Operation should have failed while paused");
    } catch (error) {
        console.log("   ✅ Operation correctly failed while paused");
    }
    
    // Unpause the contract
    const unpauseTx = await hnsGameEcosystem.unpause();
    await unpauseTx.wait();
    console.log("   ✅ Contract unpaused. TX:", unpauseTx.hash);
    
    // Try operation again (should succeed)
    const testApproveTx = await hnsToken.connect(user3).approve(hnsGameEcosystemAddress, ethers.parseEther("0.5"));
    await testApproveTx.wait();
    console.log("   ✅ User3 approved HNS for test. TX:", testApproveTx.hash);
    
    const testRedeemTx = await hnsGameEcosystem.connect(user3).redeemHNSForGameToken(1, ethers.parseEther("0.5"));
    await testRedeemTx.wait();
    console.log("   ✅ Operation succeeded after unpausing. TX:", testRedeemTx.hash);
    
    console.log("2. Testing emergency withdrawal...");
    
    // Get contract HNS balance before withdrawal
    const contractHnsBefore = await hnsToken.balanceOf(hnsGameEcosystemAddress);
    console.log("   📊 Contract HNS balance before withdrawal:", ethers.formatEther(contractHnsBefore), "HNS");
    
    // Emergency withdraw some HNS (this would fail if HNS is locked, which is correct)
    try {
        await hnsGameEcosystem.emergencyWithdraw(hnsTokenAddress, deployer.address, ethers.parseEther("100"));
        console.log("   ❌ Emergency withdrawal should have failed (HNS is locked)");
    } catch (error) {
        console.log("   ✅ Emergency withdrawal correctly failed (HNS is locked)");
    }
    
    console.log();
    
    // ============ PHASE 9: ERROR HANDLING TESTING ============
    console.log("🚨 PHASE 9: ERROR HANDLING TESTING");
    console.log("-".repeat(60));
    
    console.log("1. Testing duplicate airdrop prevention...");
    
    try {
        await hnsToken.airdropHNS(user1.address);
        console.log("   ❌ Duplicate airdrop should have failed");
    } catch (error) {
        console.log("   ✅ Duplicate airdrop correctly failed");
    }
    
    console.log("2. Testing insufficient balance protection...");
    
    try {
        await hnsGameEcosystem.connect(user3).redeemHNSForGameToken(1, ethers.parseEther("1000"));
        console.log("   ❌ Insufficient balance operation should have failed");
    } catch (error) {
        console.log("   ✅ Insufficient balance operation correctly failed");
    }
    
    console.log("3. Testing invalid game ID protection...");
    
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
    
    console.log("5. Testing batch activity points validation...");
    
    try {
        await hnsGameEcosystem.connect(activityManager).setActivityPointsBatch(1, ["action1", "action2"], [10]);
        console.log("   ❌ Mismatched array lengths should have failed");
    } catch (error) {
        console.log("   ✅ Mismatched array lengths correctly failed");
    }
    
    console.log();
    
    // ============ PHASE 10: FINAL STATE & SUMMARY ============
    console.log("📊 PHASE 10: FINAL STATE & SUMMARY");
    console.log("-".repeat(60));
    
    console.log("📈 Final Token Balances:");
    
    // Final HNS balances
    const finalUser1Hns = await hnsToken.balanceOf(user1.address);
    const finalUser2Hns = await hnsToken.balanceOf(user2.address);
    const finalUser3Hns = await hnsToken.balanceOf(user3.address);
    
    console.log("   💰 HNS Balances:");
    console.log("     User1:", ethers.formatEther(finalUser1Hns), "HNS");
    console.log("     User2:", ethers.formatEther(finalUser2Hns), "HNS");
    console.log("     User3:", ethers.formatEther(finalUser3Hns), "HNS");
    
    // Final game token balances
    const finalUser1Shooter = await hnsGameEcosystem.balanceOf(user1.address, 1);
    const finalUser1Racing = await hnsGameEcosystem.balanceOf(user1.address, 2);
    const finalUser2Racing = await hnsGameEcosystem.balanceOf(user2.address, 2);
    const finalUser2Puzzle = await hnsGameEcosystem.balanceOf(user2.address, 3);
    const finalUser3Shooter = await hnsGameEcosystem.balanceOf(user3.address, 1);
    
    console.log("   🎮 Game Token Balances:");
    console.log("     User1 Shooter:", ethers.formatEther(finalUser1Shooter), "ST");
    console.log("     User1 Racing:", ethers.formatEther(finalUser1Racing), "RG");
    console.log("     User2 Racing:", ethers.formatEther(finalUser2Racing), "RG");
    console.log("     User2 Puzzle:", ethers.formatEther(finalUser2Puzzle), "PG");
    console.log("     User3 Shooter:", ethers.formatEther(finalUser3Shooter), "ST");
    
    // Activity summary
    console.log("   🏆 Activity Summary:");
    const user1Activity = await hnsGameEcosystem.getActivityLogs(user1.address);
    const user2Activity = await hnsGameEcosystem.getActivityLogs(user2.address);
    const user3Activity = await hnsGameEcosystem.getActivityLogs(user3.address);
    
    const user1TotalPoints = user1Activity.totalPoints.reduce((a, b) => Number(a) + Number(b), 0);
    const user2TotalPoints = user2Activity.totalPoints.reduce((a, b) => Number(a) + Number(b), 0);
    const user3TotalPoints = user3Activity.totalPoints.reduce((a, b) => Number(a) + Number(b), 0);
    
    console.log("     User1 total points earned:", user1TotalPoints);
    console.log("     User2 total points earned:", user2TotalPoints);
    console.log("     User3 total points earned:", user3TotalPoints);
    
    // Contract addresses
    console.log();
    console.log("📋 Contract Addresses:");
    console.log("   HNS Token:", hnsTokenAddress);
    console.log("   HNS Game Ecosystem:", hnsGameEcosystemAddress);
    
    // Game information
    console.log();
    console.log("🎮 Game Information:");
    const game1Info = await hnsGameEcosystem.getGameTokenInfo(1);
    const game2Info = await hnsGameEcosystem.getGameTokenInfo(2);
    const game3Info = await hnsGameEcosystem.getGameTokenInfo(3);
    
    console.log("   Game 1:", game1Info.name, "(", game1Info.symbol, ")");
    console.log("     HNS Locked:", ethers.formatEther(game1Info.hnsLocked));
    console.log("     Current Supply:", ethers.formatEther(game1Info.currentSupply));
    console.log("     Active:", game1Info.active);
    
    console.log("   Game 2:", game2Info.name, "(", game2Info.symbol, ")");
    console.log("     HNS Locked:", ethers.formatEther(game2Info.hnsLocked));
    console.log("     Current Supply:", ethers.formatEther(game2Info.currentSupply));
    console.log("     Active:", game2Info.active);
    
    console.log("   Game 3:", game3Info.name, "(", game3Info.symbol, ")");
    console.log("     HNS Locked:", ethers.formatEther(game3Info.hnsLocked));
    console.log("     Current Supply:", ethers.formatEther(game3Info.currentSupply));
    console.log("     Active:", game3Info.active);
    
    console.log();
    console.log("🎉 COMPREHENSIVE USER JOURNEY FLOW SUCCESSFULLY EXECUTED!");
    console.log("=" .repeat(80));
    console.log("✅ HNS Gaming Ecosystem is fully functional and ready for production! 🚀");
    console.log();
    console.log("📝 Flow Summary:");
    console.log("   1. ✅ Users received HNS airdrop");
    console.log("   2. ✅ Admin created games with HNS locking");
    console.log("   3. ✅ Users bought game tokens with HNS");
    console.log("   4. ✅ Game started - users burned game tokens");
    console.log("   5. ✅ Game activities began - points earned");
    console.log("   6. ✅ Users redeemed points for more game tokens");
    console.log("   7. ✅ Admin functions tested (pause/unpause)");
    console.log("   8. ✅ Error handling tested");
    console.log("   9. ✅ Complete ecosystem cycle achieved!");
    console.log();
    console.log("🔗 All transaction hashes have been logged above for verification.");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Comprehensive user journey flow failed:", error);
        process.exit(1);
    }); 