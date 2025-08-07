const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HNS Gaming Ecosystem", function () {
    let hnsToken, hnsGameEcosystem;
    let owner, admin, user1, user2, activityManager;
    let gameId;
    
    const AIRDROP_AMOUNT = ethers.parseEther("1");
    const GAME_CREATION_AMOUNT = ethers.parseEther("100");
    const HNS_REDEMPTION_AMOUNT = ethers.parseEther("10");
    
    beforeEach(async function () {
        [owner, admin, user1, user2, activityManager] = await ethers.getSigners();
        
        // Deploy HNS Token
        const HNSToken = await ethers.getContractFactory("HNSToken");
        hnsToken = await HNSToken.deploy(owner.address);
        await hnsToken.waitForDeployment();
        
        // Deploy HNS Game Ecosystem
        const HNSGameEcosystem = await ethers.getContractFactory("HNSGameEcosystem");
        hnsGameEcosystem = await HNSGameEcosystem.deploy(
            await hnsToken.getAddress(),
            "https://api.hashandslash.com/metadata/"
        );
        await hnsGameEcosystem.waitForDeployment();
        
        // Setup roles
        const AIRDROP_ROLE = await hnsToken.AIRDROP_ROLE();
        await hnsToken.grantRole(AIRDROP_ROLE, await hnsGameEcosystem.getAddress());
        
        // Transfer HNS to ecosystem for airdrops
        await hnsToken.transfer(await hnsGameEcosystem.getAddress(), ethers.parseEther("10000"));
        
        // Grant activity manager role
        const ACTIVITY_MANAGER_ROLE = await hnsGameEcosystem.ACTIVITY_MANAGER_ROLE();
        await hnsGameEcosystem.grantRole(ACTIVITY_MANAGER_ROLE, activityManager.address);
    });
    
    describe("Token Setup", function () {
        it("Should deploy HNS token with correct parameters", async function () {
            expect(await hnsToken.name()).to.equal("HashAndSlash Token");
            expect(await hnsToken.symbol()).to.equal("HNS");
            expect(await hnsToken.totalSupply()).to.equal(ethers.parseEther("1000000000"));
        });
        
        it("Should deploy ecosystem with correct HNS token address", async function () {
            expect(await hnsGameEcosystem.hnsToken()).to.equal(await hnsToken.getAddress());
        });
    });
    
    describe("Airdrop System", function () {
        it("Should airdrop 1 HNS to new user", async function () {
            const initialBalance = await hnsToken.balanceOf(user1.address);
            
            await hnsGameEcosystem.airdropHNS(user1.address);
            
            const finalBalance = await hnsToken.balanceOf(user1.address);
            expect(finalBalance.sub(initialBalance)).to.equal(AIRDROP_AMOUNT);
        });
        
        it("Should prevent duplicate airdrops", async function () {
            await hnsGameEcosystem.airdropHNS(user1.address);
            
            await expect(
                hnsGameEcosystem.airdropHNS(user1.address)
            ).to.be.revertedWithCustomError(hnsToken, "AlreadyReceivedAirdrop");
        });
        
        it("Should track airdrop statistics", async function () {
            await hnsGameEcosystem.airdropHNS(user1.address);
            await hnsGameEcosystem.airdropHNS(user2.address);
            
            const stats = await hnsToken.getAirdropStats();
            expect(stats.totalAirdropped).to.equal(AIRDROP_AMOUNT.mul(2));
        });
    });
    
    describe("Game Creation (Admin Only)", function () {
        beforeEach(async function () {
            await hnsToken.approve(hnsGameEcosystem.address, GAME_CREATION_AMOUNT);
        });
        
        it("Should create game token with correct parameters", async function () {
            const tx = await hnsGameEcosystem.createGameToken(
                GAME_CREATION_AMOUNT,
                "Shooter Game",
                "ST",
                18
            );
            
            const receipt = await tx.wait();
            const event = receipt.events.find(e => e.event === "GameTokenCreated");
            
            expect(event.args.gameId).to.equal(1);
            expect(event.args.name).to.equal("Shooter Game");
            expect(event.args.symbol).to.equal("ST");
            expect(event.args.hnsLocked).to.equal(GAME_CREATION_AMOUNT);
            
            gameId = 1;
        });
        
        it("Should prevent non-admin from creating games", async function () {
            await expect(
                hnsGameEcosystem.connect(user1).createGameToken(
                    GAME_CREATION_AMOUNT,
                    "Shooter Game",
                    "ST",
                    18
                )
            ).to.be.reverted;
        });
        
        it("Should prevent duplicate game names", async function () {
            await hnsGameEcosystem.createGameToken(
                GAME_CREATION_AMOUNT,
                "Shooter Game",
                "ST",
                18
            );
            
            await expect(
                hnsGameEcosystem.createGameToken(
                    GAME_CREATION_AMOUNT,
                    "Shooter Game",
                    "ST2",
                    18
                )
            ).to.be.revertedWithCustomError(hnsGameEcosystem, "DuplicateGameName");
        });
        
        it("Should mint initial supply to admin", async function () {
            await hnsGameEcosystem.createGameToken(
                GAME_CREATION_AMOUNT,
                "Shooter Game",
                "ST",
                18
            );
            
            const balance = await hnsGameEcosystem.balanceOf(owner.address, 1);
            expect(balance).to.be.gt(0);
        });
    });
    
    describe("HNS → Game Token Redemption", function () {
        beforeEach(async function () {
            // Create a game first
            await hnsToken.approve(hnsGameEcosystem.address, GAME_CREATION_AMOUNT);
            await hnsGameEcosystem.createGameToken(
                GAME_CREATION_AMOUNT,
                "Shooter Game",
                "ST",
                18
            );
            gameId = 1;
            
            // Airdrop HNS to user1
            await hnsGameEcosystem.airdropHNS(user1.address);
        });
        
        it("Should allow users to redeem HNS for game tokens", async function () {
            const initialGameBalance = await hnsGameEcosystem.balanceOf(user1.address, gameId);
            
            await hnsToken.connect(user1).approve(hnsGameEcosystem.address, HNS_REDEMPTION_AMOUNT);
            await hnsGameEcosystem.connect(user1).redeemHNSForGameToken(gameId, HNS_REDEMPTION_AMOUNT);
            
            const finalGameBalance = await hnsGameEcosystem.balanceOf(user1.address, gameId);
            expect(finalGameBalance).to.be.gt(initialGameBalance);
        });
        
        it("Should update HNS reserves correctly", async function () {
            const initialReserves = await hnsGameEcosystem.hnsReserves();
            
            await hnsToken.connect(user1).approve(hnsGameEcosystem.address, HNS_REDEMPTION_AMOUNT);
            await hnsGameEcosystem.connect(user1).redeemHNSForGameToken(gameId, HNS_REDEMPTION_AMOUNT);
            
            const finalReserves = await hnsGameEcosystem.hnsReserves();
            expect(finalReserves.sub(initialReserves)).to.equal(HNS_REDEMPTION_AMOUNT);
        });
    });
    
    describe("Activity Points System", function () {
        beforeEach(async function () {
            // Create a game
            await hnsToken.approve(hnsGameEcosystem.address, GAME_CREATION_AMOUNT);
            await hnsGameEcosystem.createGameToken(
                GAME_CREATION_AMOUNT,
                "Shooter Game",
                "ST",
                18
            );
            gameId = 1;
            
            // Set activity points
            await hnsGameEcosystem.setActivityPoints(gameId, "shoot_enemy", 10);
            await hnsGameEcosystem.setActivityPoints(gameId, "collect_powerup", 5);
        });
        
        it("Should record user activity and award points", async function () {
            await hnsGameEcosystem.connect(activityManager).recordActivity(
                gameId,
                user1.address,
                "shoot_enemy"
            );
            
            const activity = await hnsGameEcosystem.getTransactionLogs(gameId, user1.address);
            expect(activity.totalPoints).to.equal(10);
        });
        
        it("Should prevent non-authorized users from recording activity", async function () {
            await expect(
                hnsGameEcosystem.connect(user1).recordActivity(
                    gameId,
                    user1.address,
                    "shoot_enemy"
                )
            ).to.be.reverted;
        });
        
        it("Should track multiple activities", async function () {
            await hnsGameEcosystem.connect(activityManager).recordActivity(
                gameId,
                user1.address,
                "shoot_enemy"
            );
            await hnsGameEcosystem.connect(activityManager).recordActivity(
                gameId,
                user1.address,
                "collect_powerup"
            );
            
            const activity = await hnsGameEcosystem.getTransactionLogs(gameId, user1.address);
            expect(activity.totalPoints).to.equal(15);
        });
        
        it("Should store detailed activity logs", async function () {
            await hnsGameEcosystem.connect(activityManager).recordActivity(
                gameId,
                user1.address,
                "shoot_enemy"
            );
            
            const logs = await hnsGameEcosystem.getDetailedActivityLogs(user1.address, gameId);
            expect(logs.length).to.equal(1);
            expect(logs[0].action).to.equal("shoot_enemy");
            expect(logs[0].points).to.equal(10);
        });
    });
    
    describe("Points → Game Token Redemption", function () {
        beforeEach(async function () {
            // Create a game
            await hnsToken.approve(hnsGameEcosystem.address, GAME_CREATION_AMOUNT);
            await hnsGameEcosystem.createGameToken(
                GAME_CREATION_AMOUNT,
                "Shooter Game",
                "ST",
                18
            );
            gameId = 1;
            
            // Set activity points and record activity
            await hnsGameEcosystem.setActivityPoints(gameId, "shoot_enemy", 10);
            await hnsGameEcosystem.connect(activityManager).recordActivity(
                gameId,
                user1.address,
                "shoot_enemy"
            );
        });
        
        it("Should allow users to redeem points for game tokens", async function () {
            const initialGameBalance = await hnsGameEcosystem.balanceOf(user1.address, gameId);
            
            await hnsGameEcosystem.connect(user1).redeemPointsForGameToken(gameId, 10);
            
            const finalGameBalance = await hnsGameEcosystem.balanceOf(user1.address, gameId);
            expect(finalGameBalance.sub(initialGameBalance)).to.equal(10);
        });
        
        it("Should prevent redeeming more points than available", async function () {
            await expect(
                hnsGameEcosystem.connect(user1).redeemPointsForGameToken(gameId, 20)
            ).to.be.revertedWithCustomError(hnsGameEcosystem, "InsufficientPoints");
        });
        
        it("Should track redeemed points correctly", async function () {
            await hnsGameEcosystem.connect(user1).redeemPointsForGameToken(gameId, 5);
            
            const activity = await hnsGameEcosystem.getTransactionLogs(gameId, user1.address);
            expect(activity.redeemedPoints).to.equal(5);
            expect(activity.availablePoints).to.equal(5);
        });
    });
    
    describe("Game Token Burning → HNS Return", function () {
        beforeEach(async function () {
            // Create a game
            await hnsToken.approve(hnsGameEcosystem.address, GAME_CREATION_AMOUNT);
            await hnsGameEcosystem.createGameToken(
                GAME_CREATION_AMOUNT,
                "Shooter Game",
                "ST",
                18
            );
            gameId = 1;
            
            // Give user1 some game tokens
            await hnsGameEcosystem.airdropHNS(user1.address);
            await hnsToken.connect(user1).approve(hnsGameEcosystem.address, HNS_REDEMPTION_AMOUNT);
            await hnsGameEcosystem.connect(user1).redeemHNSForGameToken(gameId, HNS_REDEMPTION_AMOUNT);
        });
        
        it("Should allow users to burn game tokens for HNS", async function () {
            const initialHNSBalance = await hnsToken.balanceOf(user1.address);
            const gameTokenBalance = await hnsGameEcosystem.balanceOf(user1.address, gameId);
            const burnAmount = gameTokenBalance.div(2);
            
            await hnsGameEcosystem.connect(user1).burnGameTokenForHNS(gameId, burnAmount);
            
            const finalHNSBalance = await hnsToken.balanceOf(user1.address);
            expect(finalHNSBalance).to.be.gt(initialHNSBalance);
        });
        
        it("Should calculate HNS return correctly", async function () {
            const gameTokenBalance = await hnsGameEcosystem.balanceOf(user1.address, gameId);
            const burnAmount = gameTokenBalance.div(2);
            
            const expectedHNSReturn = await hnsGameEcosystem.calculateHNSReturn(gameId, burnAmount);
            expect(expectedHNSReturn).to.be.gt(0);
        });
        
        it("Should prevent burning more tokens than owned", async function () {
            const gameTokenBalance = await hnsGameEcosystem.balanceOf(user1.address, gameId);
            
            await expect(
                hnsGameEcosystem.connect(user1).burnGameTokenForHNS(gameId, gameTokenBalance.add(1))
            ).to.be.revertedWithCustomError(hnsGameEcosystem, "InsufficientUserBalance");
        });
    });
    
    describe("Dashboard Functions", function () {
        beforeEach(async function () {
            // Create a game
            await hnsToken.approve(hnsGameEcosystem.address, GAME_CREATION_AMOUNT);
            await hnsGameEcosystem.createGameToken(
                GAME_CREATION_AMOUNT,
                "Shooter Game",
                "ST",
                18
            );
            gameId = 1;
            
            // Setup user activity
            await hnsGameEcosystem.airdropHNS(user1.address);
            await hnsToken.connect(user1).approve(hnsGameEcosystem.address, HNS_REDEMPTION_AMOUNT);
            await hnsGameEcosystem.connect(user1).redeemHNSForGameToken(gameId, HNS_REDEMPTION_AMOUNT);
            
            await hnsGameEcosystem.setActivityPoints(gameId, "shoot_enemy", 10);
            await hnsGameEcosystem.connect(activityManager).recordActivity(
                gameId,
                user1.address,
                "shoot_enemy"
            );
        });
        
        it("Should return user balances correctly", async function () {
            const balances = await hnsGameEcosystem.getUserBalances(user1.address);
            
            expect(balances.hnsBalance).to.be.gt(0);
            expect(balances.gameIds.length).to.be.gt(0);
            expect(balances.gameTokenBalances.length).to.be.gt(0);
        });
        
        it("Should return activity logs correctly", async function () {
            const logs = await hnsGameEcosystem.getActivityLogs(user1.address);
            
            expect(logs.gameIds.length).to.be.gt(0);
            expect(logs.totalPoints.length).to.be.gt(0);
            expect(logs.redeemedPoints.length).to.be.gt(0);
        });
        
        it("Should return transaction logs correctly", async function () {
            const logs = await hnsGameEcosystem.getTransactionLogs(gameId, user1.address);
            
            expect(logs.gameTokenBalance).to.be.gt(0);
            expect(logs.totalPoints).to.equal(10);
            expect(logs.redeemedPoints).to.equal(0);
            expect(logs.availablePoints).to.equal(10);
        });
        
        it("Should return game token info correctly", async function () {
            const gameInfo = await hnsGameEcosystem.getGameTokenInfo(gameId);
            
            expect(gameInfo.name).to.equal("Shooter Game");
            expect(gameInfo.symbol).to.equal("ST");
            expect(gameInfo.active).to.be.true;
        });
    });
    
    describe("Complete User Flow", function () {
        it("Should support complete user journey: Join → Airdrop → Redeem → Play → Earn → Redeem → Burn", async function () {
            // 1. Create game
            await hnsToken.approve(hnsGameEcosystem.address, GAME_CREATION_AMOUNT);
            await hnsGameEcosystem.createGameToken(
                GAME_CREATION_AMOUNT,
                "Shooter Game",
                "ST",
                18
            );
            gameId = 1;
            
            // 2. User joins and gets airdrop
            await hnsGameEcosystem.airdropHNS(user1.address);
            let hnsBalance = await hnsToken.balanceOf(user1.address);
            expect(hnsBalance).to.equal(AIRDROP_AMOUNT);
            
            // 3. User redeems HNS for game tokens
            await hnsToken.connect(user1).approve(hnsGameEcosystem.address, HNS_REDEMPTION_AMOUNT);
            await hnsGameEcosystem.connect(user1).redeemHNSForGameToken(gameId, HNS_REDEMPTION_AMOUNT);
            
            let gameTokenBalance = await hnsGameEcosystem.balanceOf(user1.address, gameId);
            expect(gameTokenBalance).to.be.gt(0);
            
            // 4. User plays game and earns points
            await hnsGameEcosystem.setActivityPoints(gameId, "shoot_enemy", 10);
            await hnsGameEcosystem.connect(activityManager).recordActivity(
                gameId,
                user1.address,
                "shoot_enemy"
            );
            
            let activity = await hnsGameEcosystem.getTransactionLogs(gameId, user1.address);
            expect(activity.totalPoints).to.equal(10);
            
            // 5. User redeems points for more game tokens
            await hnsGameEcosystem.connect(user1).redeemPointsForGameToken(gameId, 10);
            
            gameTokenBalance = await hnsGameEcosystem.balanceOf(user1.address, gameId);
            expect(gameTokenBalance).to.be.gt(0);
            
            // 6. User burns game tokens to get HNS back
            const burnAmount = gameTokenBalance.div(2);
            const initialHNSBalance = await hnsToken.balanceOf(user1.address);
            
            await hnsGameEcosystem.connect(user1).burnGameTokenForHNS(gameId, burnAmount);
            
            const finalHNSBalance = await hnsToken.balanceOf(user1.address);
            expect(finalHNSBalance).to.be.gt(initialHNSBalance);
            
            console.log("✅ Complete user flow test passed!");
        });
    });
}); 