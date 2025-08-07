import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';

// Import contract ABIs (you'll need to add these)
import HNSTokenABI from './contracts/HNSToken.json';
import HNSGameEcosystemABI from './contracts/HNSGameEcosystem.json';

function App() {
  const [account, setAccount] = useState('');
  const [provider, setProvider] = useState(null);
  const [hnsToken, setHnsToken] = useState(null);
  const [hnsGameEcosystem, setHnsGameEcosystem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // State for different sections
  const [tokenInfo, setTokenInfo] = useState({});
  const [userBalances, setUserBalances] = useState({});
  const [games, setGames] = useState([]);
  const [userActivity, setUserActivity] = useState({});
  const [airdropStats, setAirdropStats] = useState({});

  // Contract addresses (update these with your deployed addresses)
  const HNS_TOKEN_ADDRESS = '0x1291Be112d480055DaFd8a610b7d1e203891C274';
  const HNS_GAME_ECOSYSTEM_ADDRESS = '0x5f3f1dBD7B74C6B46e8c44f98792A1dAf8d69154';

  useEffect(() => {
    connectWallet();
  }, []);

  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        
        setProvider(provider);
        setAccount(accounts[0]);

        // Initialize contracts
        const hnsTokenContract = new ethers.Contract(HNS_TOKEN_ADDRESS, HNSTokenABI.abi, signer);
        const hnsGameEcosystemContract = new ethers.Contract(HNS_GAME_ECOSYSTEM_ADDRESS, HNSGameEcosystemABI.abi, signer);
        
        setHnsToken(hnsTokenContract);
        setHnsGameEcosystem(hnsGameEcosystemContract);

        // Load initial data
        loadTokenInfo(hnsTokenContract);
        loadUserBalances(hnsGameEcosystemContract, accounts[0]);
        loadGames(hnsGameEcosystemContract);
        loadAirdropStats(hnsTokenContract);
      } else {
        alert('Please install MetaMask!');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const loadTokenInfo = async (contract) => {
    try {
      const name = await contract.name();
      const symbol = await contract.symbol();
      const decimals = await contract.decimals();
      const totalSupply = await contract.totalSupply();
      const userBalance = await contract.balanceOf(account);

      setTokenInfo({
        name,
        symbol,
        decimals: decimals.toString(),
        totalSupply: ethers.formatEther(totalSupply),
        userBalance: ethers.formatEther(userBalance)
      });
    } catch (error) {
      console.error('Error loading token info:', error);
    }
  };

  const loadUserBalances = async (contract, userAddress) => {
    try {
      const balances = await contract.getUserBalances(userAddress);
      setUserBalances({
        hnsBalance: ethers.formatEther(balances.hnsBalance),
        gameIds: balances.gameIds.map(id => id.toString()),
        gameTokenBalances: balances.gameTokenBalances.map(balance => ethers.formatEther(balance))
      });
    } catch (error) {
      console.error('Error loading user balances:', error);
    }
  };

  const loadGames = async (contract) => {
    try {
      const gameIds = await contract.getAllGameIds();
      const gamesData = [];

      for (let i = 0; i < gameIds.length; i++) {
        const gameInfo = await contract.getGameTokenInfo(gameIds[i]);
        gamesData.push({
          id: gameIds[i].toString(),
          name: gameInfo.name,
          symbol: gameInfo.symbol,
          creator: gameInfo.creator,
          hnsLocked: ethers.formatEther(gameInfo.hnsLocked),
          initialSupply: ethers.formatEther(gameInfo.initialSupply),
          currentSupply: ethers.formatEther(gameInfo.currentSupply),
          active: gameInfo.active,
          creationTime: new Date(Number(gameInfo.creationTime) * 1000).toLocaleString()
        });
      }

      setGames(gamesData);
    } catch (error) {
      console.error('Error loading games:', error);
    }
  };

  const loadAirdropStats = async (contract) => {
    try {
      const stats = await contract.getAirdropStats();
      const hasReceived = await contract.hasUserReceivedAirdrop(account);
      
      setAirdropStats({
        totalAirdropped: ethers.formatEther(stats.airdropped),
        remainingBalance: ethers.formatEther(stats.remainingBalance),
        hasReceived
      });
    } catch (error) {
      console.error('Error loading airdrop stats:', error);
    }
  };

  // ============ HNS TOKEN FUNCTIONS ============

  const handleAirdrop = async () => {
    if (!hnsToken) return;
    
    setLoading(true);
    try {
      const tx = await hnsToken.airdropHNS(account);
      await tx.wait();
      alert('Airdrop successful! You received 1 HNS');
      loadTokenInfo(hnsToken);
      loadAirdropStats(hnsToken);
    } catch (error) {
      alert('Airdrop failed: ' + error.message);
    }
    setLoading(false);
  };

  const handleMint = async (amount) => {
    if (!hnsToken) return;
    
    setLoading(true);
    try {
      const mintAmount = ethers.parseEther(amount.toString());
      const tx = await hnsToken.mint(account, mintAmount);
      await tx.wait();
      alert(`Minted ${amount} HNS successfully!`);
      loadTokenInfo(hnsToken);
    } catch (error) {
      alert('Minting failed: ' + error.message);
    }
    setLoading(false);
  };

  // ============ GAME CREATION FUNCTIONS ============

  const handleCreateGame = async (hnsAmount, name, symbol, decimals) => {
    if (!hnsGameEcosystem || !hnsToken) return;
    
    setLoading(true);
    try {
      // Approve HNS spending
      const approveAmount = ethers.parseEther(hnsAmount.toString());
      const approveTx = await hnsToken.approve(HNS_GAME_ECOSYSTEM_ADDRESS, approveAmount);
      await approveTx.wait();

      // Create game
      const tx = await hnsGameEcosystem.createGameToken(
        approveAmount,
        name,
        symbol,
        decimals
      );
      await tx.wait();
      
      alert(`Game "${name}" created successfully!`);
      loadGames(hnsGameEcosystem);
      loadUserBalances(hnsGameEcosystem, account);
    } catch (error) {
      alert('Game creation failed: ' + error.message);
    }
    setLoading(false);
  };

  // ============ ACTIVITY POINTS FUNCTIONS ============

  const handleSetActivityPoints = async (gameId, action, points) => {
    if (!hnsGameEcosystem) return;
    
    setLoading(true);
    try {
      const tx = await hnsGameEcosystem.setActivityPoints(gameId, action, points);
      await tx.wait();
      alert(`Activity points set: ${action} = ${points} points`);
    } catch (error) {
      alert('Setting activity points failed: ' + error.message);
    }
    setLoading(false);
  };

  const handleSetActivityPointsBatch = async (gameId, actions, points) => {
    if (!hnsGameEcosystem) return;
    
    setLoading(true);
    try {
      const tx = await hnsGameEcosystem.setActivityPointsBatch(gameId, actions, points);
      await tx.wait();
      alert('Batch activity points set successfully!');
    } catch (error) {
      alert('Batch setting failed: ' + error.message);
    }
    setLoading(false);
  };

  const handleRecordActivity = async (gameId, user, action) => {
    if (!hnsGameEcosystem) return;
    
    setLoading(true);
    try {
      const tx = await hnsGameEcosystem.recordActivity(gameId, user, action);
      await tx.wait();
      alert(`Activity recorded: ${action} for user ${user}`);
    } catch (error) {
      alert('Recording activity failed: ' + error.message);
    }
    setLoading(false);
  };

  // ============ TOKEN REDEMPTION FUNCTIONS ============

  const handleRedeemHNSForGameToken = async (gameId, hnsAmount) => {
    if (!hnsGameEcosystem || !hnsToken) return;
    
    setLoading(true);
    try {
      // Approve HNS spending
      const approveAmount = ethers.parseEther(hnsAmount.toString());
      const approveTx = await hnsToken.approve(HNS_GAME_ECOSYSTEM_ADDRESS, approveAmount);
      await approveTx.wait();

      // Redeem HNS for game tokens
      const tx = await hnsGameEcosystem.redeemHNSForGameToken(gameId, approveAmount);
      await tx.wait();
      
      alert(`Redeemed ${hnsAmount} HNS for game tokens!`);
      loadUserBalances(hnsGameEcosystem, account);
      loadTokenInfo(hnsToken);
    } catch (error) {
      alert('Redemption failed: ' + error.message);
    }
    setLoading(false);
  };

  const handleRedeemPointsForGameToken = async (gameId, points) => {
    if (!hnsGameEcosystem) return;
    
    setLoading(true);
    try {
      const tx = await hnsGameEcosystem.redeemPointsForGameToken(gameId, points);
      await tx.wait();
      
      alert(`Redeemed ${points} points for game tokens!`);
      loadUserBalances(hnsGameEcosystem, account);
    } catch (error) {
      alert('Points redemption failed: ' + error.message);
    }
    setLoading(false);
  };

  // ============ TOKEN BURNING FUNCTIONS ============

  const handleBurnGameTokenForHNS = async (gameId, burnAmount) => {
    if (!hnsGameEcosystem) return;
    
    setLoading(true);
    try {
      const burnAmountWei = ethers.parseEther(burnAmount.toString());
      const tx = await hnsGameEcosystem.burnGameTokenForHNS(gameId, burnAmountWei);
      await tx.wait();
      
      alert(`Burned ${burnAmount} game tokens for HNS!`);
      loadUserBalances(hnsGameEcosystem, account);
      loadTokenInfo(hnsToken);
    } catch (error) {
      alert('Burning failed: ' + error.message);
    }
    setLoading(false);
  };

  // ============ ADMIN FUNCTIONS ============

  const handlePause = async () => {
    if (!hnsGameEcosystem) return;
    
    setLoading(true);
    try {
      const tx = await hnsGameEcosystem.pause();
      await tx.wait();
      alert('Contract paused successfully!');
    } catch (error) {
      alert('Pausing failed: ' + error.message);
    }
    setLoading(false);
  };

  const handleUnpause = async () => {
    if (!hnsGameEcosystem) return;
    
    setLoading(true);
    try {
      const tx = await hnsGameEcosystem.unpause();
      await tx.wait();
      alert('Contract unpaused successfully!');
    } catch (error) {
      alert('Unpausing failed: ' + error.message);
    }
    setLoading(false);
  };

  // ============ RENDER FUNCTIONS ============

  const renderDashboard = () => (
    <div className="dashboard">
      <h2>📊 Dashboard</h2>
      
      <div className="dashboard-grid">
        <div className="card">
          <h3>💰 Token Information</h3>
          <p><strong>Name:</strong> {tokenInfo.name}</p>
          <p><strong>Symbol:</strong> {tokenInfo.symbol}</p>
          <p><strong>Decimals:</strong> {tokenInfo.decimals}</p>
          <p><strong>Total Supply:</strong> {tokenInfo.totalSupply} HNS</p>
          <p><strong>Your Balance:</strong> {tokenInfo.userBalance} HNS</p>
        </div>

        <div className="card">
          <h3>🎁 Airdrop Status</h3>
          <p><strong>Total Airdropped:</strong> {airdropStats.totalAirdropped} HNS</p>
          <p><strong>Remaining Balance:</strong> {airdropStats.remainingBalance} HNS</p>
          <p><strong>You Received Airdrop:</strong> {airdropStats.hasReceived ? 'Yes' : 'No'}</p>
          {!airdropStats.hasReceived && (
            <button onClick={handleAirdrop} disabled={loading}>
              {loading ? 'Processing...' : 'Claim Airdrop (1 HNS)'}
            </button>
          )}
        </div>

        <div className="card">
          <h3>🎮 Your Game Balances</h3>
          <p><strong>HNS Balance:</strong> {userBalances.hnsBalance} HNS</p>
          <p><strong>Games Participating:</strong> {userBalances.gameIds?.length || 0}</p>
          {userBalances.gameIds?.map((gameId, index) => (
            <p key={gameId}>
              <strong>Game {gameId}:</strong> {userBalances.gameTokenBalances?.[index]} tokens
            </p>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTokenFunctions = () => (
    <div className="token-functions">
      <h2>🪙 HNS Token Functions</h2>
      
      <div className="function-section">
        <h3>Minting</h3>
        <div className="input-group">
          <input type="number" id="mintAmount" placeholder="Amount to mint" />
          <button onClick={() => handleMint(document.getElementById('mintAmount').value)} disabled={loading}>
            {loading ? 'Processing...' : 'Mint HNS'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderGameCreation = () => (
    <div className="game-creation">
      <h2>🎮 Game Creation</h2>
      
      <div className="form">
        <div className="input-group">
          <input type="number" id="gameHnsAmount" placeholder="HNS Amount to lock" />
          <input type="text" id="gameName" placeholder="Game Name" />
          <input type="text" id="gameSymbol" placeholder="Game Symbol" />
          <input type="number" id="gameDecimals" placeholder="Decimals (18)" defaultValue="18" />
          <button onClick={() => {
            const hnsAmount = document.getElementById('gameHnsAmount').value;
            const name = document.getElementById('gameName').value;
            const symbol = document.getElementById('gameSymbol').value;
            const decimals = document.getElementById('gameDecimals').value;
            handleCreateGame(hnsAmount, name, symbol, decimals);
          }} disabled={loading}>
            {loading ? 'Creating...' : 'Create Game'}
          </button>
        </div>
      </div>

      <div className="games-list">
        <h3>📋 Created Games</h3>
        {games.map(game => (
          <div key={game.id} className="game-card">
            <h4>{game.name} ({game.symbol})</h4>
            <p><strong>ID:</strong> {game.id}</p>
            <p><strong>Creator:</strong> {game.creator}</p>
            <p><strong>HNS Locked:</strong> {game.hnsLocked} HNS</p>
            <p><strong>Initial Supply:</strong> {game.initialSupply}</p>
            <p><strong>Current Supply:</strong> {game.currentSupply}</p>
            <p><strong>Active:</strong> {game.active ? 'Yes' : 'No'}</p>
            <p><strong>Created:</strong> {game.creationTime}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderActivityPoints = () => (
    <div className="activity-points">
      <h2>🏆 Activity Points System</h2>
      
      <div className="function-section">
        <h3>Set Activity Points (Individual)</h3>
        <div className="input-group">
          <input type="number" id="activityGameId" placeholder="Game ID" />
          <input type="text" id="activityAction" placeholder="Action Name" />
          <input type="number" id="activityPoints" placeholder="Points" />
          <button onClick={() => {
            const gameId = document.getElementById('activityGameId').value;
            const action = document.getElementById('activityAction').value;
            const points = document.getElementById('activityPoints').value;
            handleSetActivityPoints(gameId, action, points);
          }} disabled={loading}>
            {loading ? 'Setting...' : 'Set Activity Points'}
          </button>
        </div>
      </div>

      <div className="function-section">
        <h3>Set Activity Points (Batch)</h3>
        <div className="input-group">
          <input type="number" id="batchGameId" placeholder="Game ID" />
          <input type="text" id="batchActions" placeholder="Actions (comma-separated)" />
          <input type="text" id="batchPoints" placeholder="Points (comma-separated)" />
          <button onClick={() => {
            const gameId = document.getElementById('batchGameId').value;
            const actions = document.getElementById('batchActions').value.split(',').map(a => a.trim());
            const points = document.getElementById('batchPoints').value.split(',').map(p => parseInt(p.trim()));
            handleSetActivityPointsBatch(gameId, actions, points);
          }} disabled={loading}>
            {loading ? 'Setting...' : 'Set Batch Activity Points'}
          </button>
        </div>
      </div>

      <div className="function-section">
        <h3>Record Activity</h3>
        <div className="input-group">
          <input type="number" id="recordGameId" placeholder="Game ID" />
          <input type="text" id="recordUser" placeholder="User Address" />
          <input type="text" id="recordAction" placeholder="Action" />
          <button onClick={() => {
            const gameId = document.getElementById('recordGameId').value;
            const user = document.getElementById('recordUser').value;
            const action = document.getElementById('recordAction').value;
            handleRecordActivity(gameId, user, action);
          }} disabled={loading}>
            {loading ? 'Recording...' : 'Record Activity'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderTokenRedemption = () => (
    <div className="token-redemption">
      <h2>🔄 Token Redemption</h2>
      
      <div className="function-section">
        <h3>Redeem HNS for Game Tokens</h3>
        <div className="input-group">
          <input type="number" id="redeemGameId" placeholder="Game ID" />
          <input type="number" id="redeemHnsAmount" placeholder="HNS Amount" />
          <button onClick={() => {
            const gameId = document.getElementById('redeemGameId').value;
            const hnsAmount = document.getElementById('redeemHnsAmount').value;
            handleRedeemHNSForGameToken(gameId, hnsAmount);
          }} disabled={loading}>
            {loading ? 'Redeeming...' : 'Redeem HNS for Game Tokens'}
          </button>
        </div>
      </div>

      <div className="function-section">
        <h3>Redeem Points for Game Tokens</h3>
        <div className="input-group">
          <input type="number" id="redeemPointsGameId" placeholder="Game ID" />
          <input type="number" id="redeemPoints" placeholder="Points Amount" />
          <button onClick={() => {
            const gameId = document.getElementById('redeemPointsGameId').value;
            const points = document.getElementById('redeemPoints').value;
            handleRedeemPointsForGameToken(gameId, points);
          }} disabled={loading}>
            {loading ? 'Redeeming...' : 'Redeem Points for Game Tokens'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderTokenBurning = () => (
    <div className="token-burning">
      <h2>🔥 Token Burning</h2>
      
      <div className="function-section">
        <h3>Burn Game Tokens for HNS</h3>
        <div className="input-group">
          <input type="number" id="burnGameId" placeholder="Game ID" />
          <input type="number" id="burnAmount" placeholder="Game Token Amount" />
          <button onClick={() => {
            const gameId = document.getElementById('burnGameId').value;
            const burnAmount = document.getElementById('burnAmount').value;
            handleBurnGameTokenForHNS(gameId, burnAmount);
          }} disabled={loading}>
            {loading ? 'Burning...' : 'Burn Game Tokens for HNS'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderAdminFunctions = () => (
    <div className="admin-functions">
      <h2>⚙️ Admin Functions</h2>
      
      <div className="function-section">
        <h3>Contract Control</h3>
        <div className="button-group">
          <button onClick={handlePause} disabled={loading}>
            {loading ? 'Processing...' : 'Pause Contract'}
          </button>
          <button onClick={handleUnpause} disabled={loading}>
            {loading ? 'Processing...' : 'Unpause Contract'}
          </button>
        </div>
      </div>
    </div>
  );

  if (!account) {
    return (
      <div className="App">
        <div className="connect-wallet">
          <h1>🎮 HNS Gaming Ecosystem</h1>
          <p>Connect your wallet to start using the HNS Gaming Ecosystem</p>
          <button onClick={connectWallet}>Connect Wallet</button>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="header">
        <h1>🎮 HNS Gaming Ecosystem</h1>
        <div className="wallet-info">
          <span>Connected: {account.slice(0, 6)}...{account.slice(-4)}</span>
        </div>
      </header>

      <nav className="navigation">
        <button 
          className={activeTab === 'dashboard' ? 'active' : ''} 
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button 
          className={activeTab === 'token' ? 'active' : ''} 
          onClick={() => setActiveTab('token')}
        >
          🪙 Token Functions
        </button>
        <button 
          className={activeTab === 'games' ? 'active' : ''} 
          onClick={() => setActiveTab('games')}
        >
          🎮 Game Creation
        </button>
        <button 
          className={activeTab === 'activity' ? 'active' : ''} 
          onClick={() => setActiveTab('activity')}
        >
          🏆 Activity Points
        </button>
        <button 
          className={activeTab === 'redemption' ? 'active' : ''} 
          onClick={() => setActiveTab('redemption')}
        >
          🔄 Token Redemption
        </button>
        <button 
          className={activeTab === 'burning' ? 'active' : ''} 
          onClick={() => setActiveTab('burning')}
        >
          🔥 Token Burning
        </button>
        <button 
          className={activeTab === 'admin' ? 'active' : ''} 
          onClick={() => setActiveTab('admin')}
        >
          ⚙️ Admin Functions
        </button>
      </nav>

      <main className="main-content">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'token' && renderTokenFunctions()}
        {activeTab === 'games' && renderGameCreation()}
        {activeTab === 'activity' && renderActivityPoints()}
        {activeTab === 'redemption' && renderTokenRedemption()}
        {activeTab === 'burning' && renderTokenBurning()}
        {activeTab === 'admin' && renderAdminFunctions()}
      </main>

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">Processing...</div>
        </div>
      )}
    </div>
  );
}

export default App; 