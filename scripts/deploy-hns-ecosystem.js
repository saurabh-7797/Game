const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    
    console.log("Deploying HNS Gaming Ecosystem with account:", deployer.address);
    console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());
    
    // Deploy HNS Token
    console.log("\n1. Deploying HNS Token...");
    const HNSToken = await ethers.getContractFactory("HNSToken");
    const hnsToken = await HNSToken.deploy(deployer.address);
    await hnsToken.waitForDeployment();
    const hnsTokenAddress = await hnsToken.getAddress();
    console.log("HNS Token deployed to:", hnsTokenAddress);
    
    // Deploy HNS Game Ecosystem
    console.log("\n2. Deploying HNS Game Ecosystem...");
    const HNSGameEcosystem = await ethers.getContractFactory("HNSGameEcosystem");
    const hnsGameEcosystem = await HNSGameEcosystem.deploy(
        hnsTokenAddress,
        "https://api.hashandslash.com/metadata/" // Base URI for ERC-1155 metadata
    );
    await hnsGameEcosystem.waitForDeployment();
    const hnsGameEcosystemAddress = await hnsGameEcosystem.getAddress();
    console.log("HNS Game Ecosystem deployed to:", hnsGameEcosystemAddress);
    
    // Grant roles to the ecosystem contract
    console.log("\n3. Setting up roles and permissions...");
    
    // Grant AIRDROP_ROLE to ecosystem contract for future airdrops
    const AIRDROP_ROLE = await hnsToken.AIRDROP_ROLE();
    await hnsToken.grantRole(AIRDROP_ROLE, hnsGameEcosystemAddress);
    console.log("Granted AIRDROP_ROLE to ecosystem contract");
    
    // Transfer some HNS to ecosystem contract for airdrops
    const airdropAmount = ethers.parseEther("10000"); // 10,000 HNS for airdrops
    await hnsToken.transfer(hnsGameEcosystemAddress, airdropAmount);
    console.log("Transferred", ethers.formatEther(airdropAmount), "HNS to ecosystem for airdrops");
    
    // Verify deployment
    console.log("\n4. Verifying deployment...");
    
    const deployerHNSBalance = await hnsToken.balanceOf(deployer.address);
    const ecosystemHNSBalance = await hnsToken.balanceOf(hnsGameEcosystemAddress);
    const totalSupply = await hnsToken.totalSupply();
    
    console.log("Deployer HNS balance:", ethers.formatEther(deployerHNSBalance));
    console.log("Ecosystem HNS balance:", ethers.formatEther(ecosystemHNSBalance));
    console.log("Total HNS supply:", ethers.formatEther(totalSupply));
    
    // Test airdrop functionality
    console.log("\n5. Testing airdrop functionality...");
    const testUser = "0x1234567890123456789012345678901234567890"; // Example address
    
    try {
        await hnsToken.airdropHNS(testUser);
        console.log("✅ Airdrop test successful");
    } catch (error) {
        console.log("❌ Airdrop test failed:", error.message);
    }
    
    // Test game creation
    console.log("\n6. Testing game creation...");
    const gameCreationAmount = ethers.parseEther("100"); // 100 HNS for game creation
    
    // Approve HNS spending
    await hnsToken.approve(hnsGameEcosystemAddress, gameCreationAmount);
    
    try {
        const tx = await hnsGameEcosystem.createGameToken(
            gameCreationAmount,
            "Shooter Game",
            "ST",
            18
        );
        const receipt = await tx.wait();
        console.log("✅ Game creation successful");
        console.log("Transaction hash:", receipt.hash);
        
        // Get created game info
        const gameInfo = await hnsGameEcosystem.getGameTokenInfo(1);
        console.log("Game created:", {
            name: gameInfo.name,
            symbol: gameInfo.symbol,
            hnsLocked: ethers.formatEther(gameInfo.hnsLocked),
            initialSupply: ethers.formatEther(gameInfo.initialSupply)
        });
        
    } catch (error) {
        console.log("❌ Game creation failed:", error.message);
    }
    
    // Set up activity points for the game
    console.log("\n7. Setting up activity points...");
    try {
        await hnsGameEcosystem.setActivityPoints(1, "shoot_enemy", 10);
        await hnsGameEcosystem.setActivityPoints(1, "collect_powerup", 5);
        await hnsGameEcosystem.setActivityPoints(1, "complete_level", 50);
        console.log("✅ Activity points configured");
    } catch (error) {
        console.log("❌ Activity points setup failed:", error.message);
    }
    
    console.log("\n🎉 HNS Gaming Ecosystem deployment completed!");
    console.log("\n=== DEPLOYMENT SUMMARY ===");
    console.log("HNS Token:", hnsTokenAddress);
    console.log("HNS Game Ecosystem:", hnsGameEcosystemAddress);
    console.log("Deployer:", deployer.address);
    console.log("\n=== NEXT STEPS ===");
    console.log("1. Verify contracts on Etherscan");
    console.log("2. Set up frontend integration");
    console.log("3. Configure activity points for games");
    console.log("4. Test user flows");
    
    // Save deployment info
    const deploymentInfo = {
        network: "localhost",
        deployer: deployer.address,
        hnsToken: hnsTokenAddress,
        hnsGameEcosystem: hnsGameEcosystemAddress,
        deploymentTime: new Date().toISOString()
    };
    
    const fs = require('fs');
    fs.writeFileSync(
        'deployment-info.json',
        JSON.stringify(deploymentInfo, null, 2)
    );
    console.log("\nDeployment info saved to deployment-info.json");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 