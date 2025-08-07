const { ethers } = require("hardhat");

async function main() {
    console.log("📊 HNS GAMING ECOSYSTEM - COMPLETE DASHBOARD");
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
    
    // ============ CONTRACT ADDRESSES ============
    console.log("🏗️ CONTRACT ADDRESSES");
    console.log("-".repeat(60));
    
    // Get deployed contract addresses (you'll need to update these with your actual addresses)
    const HNS_TOKEN_ADDRESS = "0x525C7063E7C20997BaaE9bDa922159152D0e8417"; // Update with your deployed address
    const HNS_GAME_ECOSYSTEM_ADDRESS = "0x38a024C0b412B9d1db8BC398140D00F5Af3093D4"; // Update with your deployed address
    
    console.log("📍 HNS Token Address:", HNS_TOKEN_ADDRESS);
    console.log("🎮 HNS Game Ecosystem Address:", HNS_GAME_ECOSYSTEM_ADDRESS);
    console.log();
    
    // ============ CONTRACT INSTANCES ============
    console.log("🔗 CONTRACT INSTANCES");
    console.log("-".repeat(60));
    
    const hnsToken = await ethers.getContractAt("HNSToken", HNS_TOKEN_ADDRESS);
    const hnsGameEcosystem = await ethers.getContractAt("HNSGameEcosystem", HNS_GAME_ECOSYSTEM_ADDRESS);
    
    console.log("✅ HNS Token contract loaded");
    console.log("✅ HNS Game Ecosystem contract loaded");
    console.log();
    
    // ============ HNS TOKEN FUNCTIONS ============
    console.log("💰 HNS TOKEN INFORMATION");
    console.log("-".repeat(60));
    
    // Basic token info
    const tokenName = await hnsToken.name();
    const tokenSymbol = await hnsToken.symbol();
    const tokenDecimals = await hnsToken.decimals();
    const totalSupply = await hnsToken.totalSupply();
    
    console.log("📋 Token Details:");
    console.log("   Name:", tokenName);
    console.log("   Symbol:", tokenSymbol);
    console.log("   Decimals:", tokenDecimals.toString());
    console.log("   Total Supply:", ethers.formatEther(totalSupply), "HNS");
    
    // Airdrop information
    const airdropStats = await hnsToken.getAirdropStats();
    console.log("📊 Airdrop Statistics:");
    console.log("   Total Airdropped:", ethers.formatEther(airdropStats.airdropped), "HNS");
    console.log("   Remaining Balance:", ethers.formatEther(airdropStats.remainingBalance), "HNS");
    
    // Check airdrop status for each user
    console.log("🎁 User Airdrop Status:");
    const user1AirdropStatus = await hnsToken.hasReceivedAirdrop(user1.address);
    const user2AirdropStatus = await hnsToken.hasReceivedAirdrop(user2.address);
    const user3AirdropStatus = await hnsToken.hasReceivedAirdrop(user3.address);
    
    console.log("   User1:", user1AirdropStatus ? "✅ Received" : "❌ Not Received");
    console.log("   User2:", user2AirdropStatus ? "✅ Received" : "❌ Not Received");
    console.log("   User3:", user3AirdropStatus ? "✅ Received" : "❌ Not Received");
    
    // HNS balances
    console.log("💰 HNS Balances:");
    const deployerHns = await hnsToken.balanceOf(deployer.address);
    const user1Hns = await hnsToken.balanceOf(user1.address);
    const user2Hns = await hnsToken.balanceOf(user2.address);
    const user3Hns = await hnsToken.balanceOf(user3.address);
    const gameCreatorHns = await hnsToken.balanceOf(gameCreator.address);
    const ecosystemHns = await hnsToken.balanceOf(HNS_GAME_ECOSYSTEM_ADDRESS);
    
    console.log("   Deployer:", ethers.formatEther(deployerHns), "HNS");
    console.log("   User1:", ethers.formatEther(user1Hns), "HNS");
    console.log("   User2:", ethers.formatEther(user2Hns), "HNS");
    console.log("   User3:", ethers.formatEther(user3Hns), "HNS");
    console.log("   GameCreator:", ethers.formatEther(gameCreatorHns), "HNS");
    console.log("   Ecosystem Contract:", ethers.formatEther(ecosystemHns), "HNS");
    
    console.log();
    
    // ============ GAME ECOSYSTEM FUNCTIONS ============
    console.log("🎮 GAME ECOSYSTEM INFORMATION");
    console.log("-".repeat(60));
    
    // Contract state
    const isPaused = await hnsGameEcosystem.paused();
    const nextGameId = await hnsGameEcosystem.nextGameId();
    const hnsReserves = await hnsGameEcosystem.hnsReserves();
    
    console.log("📊 Contract State:");
    console.log("   Paused:", isPaused ? "❌ Yes" : "✅ No");
    console.log("   Next Game ID:", nextGameId.toString());
    console.log("   HNS Reserves:", ethers.formatEther(hnsReserves), "HNS");
    
    // Role information
    console.log("🔐 Role Information:");
    const GAME_CREATOR_ROLE = await hnsGameEcosystem.GAME_CREATOR_ROLE();
    const ACTIVITY_MANAGER_ROLE = await hnsGameEcosystem.ACTIVITY_MANAGER_ROLE();
    const PAUSER_ROLE = await hnsGameEcosystem.PAUSER_ROLE();
    const EMERGENCY_ROLE = await hnsGameEcosystem.EMERGENCY_ROLE();
    
    const hasGameCreatorRole = await hnsGameEcosystem.hasRole(GAME_CREATOR_ROLE, gameCreator.address);
    const hasActivityManagerRole = await hnsGameEcosystem.hasRole(ACTIVITY_MANAGER_ROLE, activityManager.address);
    const hasPauserRole = await hnsGameEcosystem.hasRole(PAUSER_ROLE, deployer.address);
    const hasEmergencyRole = await hnsGameEcosystem.hasRole(EMERGENCY_ROLE, deployer.address);
    
    console.log("   GameCreator Role:", hasGameCreatorRole ? "✅ Granted" : "❌ Not Granted");
    console.log("   ActivityManager Role:", hasActivityManagerRole ? "✅ Granted" : "❌ Not Granted");
    console.log("   Pauser Role:", hasPauserRole ? "✅ Granted" : "❌ Not Granted");
    console.log("   Emergency Role:", hasEmergencyRole ? "✅ Granted" : "❌ Not Granted");
    
    console.log();
    
    // ============ GAME INFORMATION ============
    console.log("🎯 GAME DETAILS");
    console.log("-".repeat(60));
    
    // Get all game information
    for (let gameId = 1; gameId < nextGameId; gameId++) {
        try {
            const gameInfo = await hnsGameEcosystem.getGameTokenInfo(gameId);
            
            console.log(`🎮 Game ${gameId}: ${gameInfo.name} (${gameInfo.symbol})`);
            console.log("   Creator:", gameInfo.creator);
            console.log("   Decimals:", gameInfo.decimals.toString());
            console.log("   Initial Supply:", ethers.formatEther(gameInfo.initialSupply));
            console.log("   HNS Locked:", ethers.formatEther(gameInfo.hnsLocked));
            console.log("   Current Supply:", ethers.formatEther(gameInfo.currentSupply));
            console.log("   Active:", gameInfo.active ? "✅ Yes" : "❌ No");
            console.log("   Creation Time:", new Date(Number(gameInfo.creationTime) * 1000).toLocaleString());
            
            // Get activity points for this game
            console.log("   🏆 Activity Points:");
            const activities = ["shoot_enemy", "collect_powerup", "complete_level", "headshot_bonus", 
                              "finish_race", "collect_boost", "win_championship", "drift_bonus",
                              "solve_puzzle", "hint_used", "time_bonus", "perfect_score"];
            
            for (const activity of activities) {
                try {
                    const points = await hnsGameEcosystem.activityPointValues(gameId, activity);
                    if (points > 0) {
                        console.log(`     ${activity}: ${points} points`);
                    }
                } catch (error) {
                    // Activity not configured for this game
                }
            }
            
            console.log();
        } catch (error) {
            console.log(`❌ Error getting Game ${gameId} info:`, error.message);
        }
    }
    
    // ============ USER BALANCES ============
    console.log("👤 USER BALANCES & ACTIVITIES");
    console.log("-".repeat(60));
    
    const users = [user1, user2, user3];
    const userNames = ["User1", "User2", "User3"];
    
    for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const userName = userNames[i];
        
        console.log(`📊 ${userName} (${user.address}):`);
        
        // Get complete user balances
        const userBalances = await hnsGameEcosystem.getUserBalances(user.address);
        console.log("   💰 HNS Balance:", ethers.formatEther(userBalances.hnsBalance), "HNS");
        
        console.log("   🎮 Game Token Balances:");
        for (let j = 0; j < userBalances.gameIds.length; j++) {
            const gameId = userBalances.gameIds[j];
            const balance = userBalances.gameTokenBalances[j];
            console.log(`     Game ${gameId}: ${ethers.formatEther(balance)} tokens`);
        }
        
        // Get activity logs
        const activityLogs = await hnsGameEcosystem.getActivityLogs(user.address);
        console.log("   🏆 Activity Summary:");
        console.log("     Games Played:", activityLogs.gameIds.length);
        console.log("     Total Points:", activityLogs.totalPoints.map(p => p.toString()));
        console.log("     Redeemed Points:", activityLogs.redeemedPoints.map(p => p.toString()));
        
        // Get detailed activity for each game
        for (let gameId = 1; gameId < nextGameId; gameId++) {
            try {
                const transactionLogs = await hnsGameEcosystem.getTransactionLogs(gameId, user.address);
                if (transactionLogs.totalPoints > 0 || transactionLogs.gameTokenBalance > 0) {
                    console.log(`     Game ${gameId} Details:`);
                    console.log(`       Game Tokens: ${ethers.formatEther(transactionLogs.gameTokenBalance)}`);
                    console.log(`       Total Points: ${transactionLogs.totalPoints}`);
                    console.log(`       Redeemed Points: ${transactionLogs.redeemedPoints}`);
                    console.log(`       Available Points: ${transactionLogs.availablePoints}`);
                    
                    // Get detailed activity logs
                    const detailedLogs = await hnsGameEcosystem.getDetailedActivityLogs(user.address, gameId);
                    if (detailedLogs.length > 0) {
                        console.log(`       Activities:`);
                        for (const activity of detailedLogs) {
                            console.log(`         ${activity.action}: ${activity.points} points (${new Date(Number(activity.timestamp) * 1000).toLocaleString()})`);
                        }
                    }
                }
            } catch (error) {
                // No activity for this game
            }
        }
        
        console.log();
    }
    
    // ============ HNS RETURN CALCULATIONS ============
    console.log("🧮 HNS RETURN CALCULATIONS");
    console.log("-".repeat(60));
    
    // Calculate HNS returns for different scenarios
    for (let gameId = 1; gameId < nextGameId; gameId++) {
        try {
            const gameInfo = await hnsGameEcosystem.getGameTokenInfo(gameId);
            console.log(`🎮 Game ${gameId} (${gameInfo.name}) HNS Return Examples:`);
            
            const burnAmounts = [0.1, 0.5, 1.0, 5.0];
            for (const amount of burnAmounts) {
                const burnAmountWei = ethers.parseEther(amount.toString());
                const hnsReturn = await hnsGameEcosystem.calculateHNSReturn(gameId, burnAmountWei);
                console.log(`   Burn ${amount} tokens → Get ${ethers.formatEther(hnsReturn)} HNS`);
            }
            console.log();
        } catch (error) {
            console.log(`❌ Error calculating returns for Game ${gameId}:`, error.message);
        }
    }
    
    // ============ ECOSYSTEM STATISTICS ============
    console.log("📈 ECOSYSTEM STATISTICS");
    console.log("-".repeat(60));
    
    let totalHnsLocked = ethers.parseEther("0");
    let totalGameTokens = ethers.parseEther("0");
    let totalPointsEarned = 0;
    let totalPointsRedeemed = 0;
    
    for (let gameId = 1; gameId < nextGameId; gameId++) {
        try {
            const gameInfo = await hnsGameEcosystem.getGameTokenInfo(gameId);
            totalHnsLocked += gameInfo.hnsLocked;
            totalGameTokens += gameInfo.currentSupply;
        } catch (error) {
            // Skip invalid games
        }
    }
    
    for (const user of users) {
        try {
            const activityLogs = await hnsGameEcosystem.getActivityLogs(user.address);
            for (let i = 0; i < activityLogs.totalPoints.length; i++) {
                totalPointsEarned += Number(activityLogs.totalPoints[i]);
                totalPointsRedeemed += Number(activityLogs.redeemedPoints[i]);
            }
        } catch (error) {
            // Skip users with no activity
        }
    }
    
    console.log("📊 Total Ecosystem Metrics:");
    console.log("   Total HNS Locked:", ethers.formatEther(totalHnsLocked), "HNS");
    console.log("   Total Game Tokens:", ethers.formatEther(totalGameTokens));
    console.log("   Total Points Earned:", totalPointsEarned);
    console.log("   Total Points Redeemed:", totalPointsRedeemed);
    console.log("   Total Points Available:", totalPointsEarned - totalPointsRedeemed);
    console.log("   Number of Games:", (Number(nextGameId) - 1).toString());
    console.log("   Number of Active Users:", users.length);
    
    console.log();
    console.log("🎉 DASHBOARD COMPLETE!");
    console.log("=" .repeat(80));
    console.log("✅ All get/view functions have been called and displayed!");
    console.log("📊 This provides a complete overview of the HNS Gaming Ecosystem state.");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Dashboard script failed:", error);
        process.exit(1);
    }); 