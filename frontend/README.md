# 🎮 HNS Gaming Ecosystem Frontend

A modern React frontend for the HNS Gaming Ecosystem - a comprehensive blockchain gaming platform with token management, activity points, and game creation capabilities.

## 🚀 Features

### 📊 Dashboard
- **Token Information Display**: View HNS token details, total supply, and user balance
- **Airdrop Status**: Check airdrop eligibility and claim 1 HNS
- **Game Balances**: View all game token balances in one place
- **Real-time Updates**: Live balance updates after transactions

### 🪙 Token Functions
- **HNS Minting**: Mint new HNS tokens (admin only)
- **Balance Tracking**: Real-time HNS balance monitoring
- **Airdrop Management**: Single and batch airdrop functionality

### 🎮 Game Creation
- **Create New Games**: Deploy new game tokens with custom parameters
- **Game Information**: View detailed game statistics and metadata
- **Game List**: Browse all created games with their details

### 🏆 Activity Points System
- **Individual Activity Points**: Set point values for specific actions
- **Batch Activity Points**: Configure multiple activities at once
- **Activity Recording**: Record user activities and award points
- **Points Tracking**: Monitor user activity and points earned

### 🔄 Token Redemption
- **HNS → Game Tokens**: Convert HNS to specific game tokens
- **Points → Game Tokens**: Redeem activity points for game tokens
- **Real-time Conversion**: Instant token conversion with live updates

### 🔥 Token Burning
- **Game Token Burning**: Burn game tokens to receive HNS back
- **HNS Return Calculation**: Preview HNS return before burning
- **Proportional Returns**: Fair HNS distribution based on locked value

### ⚙️ Admin Functions
- **Contract Pause/Unpause**: Emergency control over contract operations
- **Role Management**: Access control for different user types
- **Emergency Withdrawal**: Recovery functions for stuck tokens

## 🛠️ Technology Stack

- **React 18**: Modern React with hooks and functional components
- **Ethers.js v6**: Ethereum library for blockchain interactions
- **MetaMask Integration**: Seamless wallet connection
- **Responsive Design**: Mobile-first approach with modern UI/UX
- **Real-time Updates**: Live data synchronization with blockchain

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MetaMask browser extension
- Access to Ethereum network (local or testnet)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/saurabh-7797/Game.git
   cd Game/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure contract addresses**
   Update the contract addresses in `src/App.js`:
   ```javascript
   const HNS_TOKEN_ADDRESS = 'YOUR_HNS_TOKEN_ADDRESS';
   const HNS_GAME_ECOSYSTEM_ADDRESS = 'YOUR_HNS_GAME_ECOSYSTEM_ADDRESS';
   ```

4. **Add contract ABIs**
   Copy the compiled contract ABIs to `src/contracts/`:
   - `HNSToken.json`
   - `HNSGameEcosystem.json`

5. **Start the development server**
   ```bash
   npm start
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the frontend directory:
```env
REACT_APP_HNS_TOKEN_ADDRESS=your_hns_token_address
REACT_APP_HNS_GAME_ECOSYSTEM_ADDRESS=your_hns_game_ecosystem_address
REACT_APP_NETWORK_ID=your_network_id
```

### Network Configuration
The frontend supports multiple networks:
- **Localhost**: `http://localhost:8545`
- **Hardhat Network**: `http://localhost:8545`
- **Testnet**: Configure MetaMask for your preferred testnet

## 🎯 Usage Guide

### 1. Connect Wallet
- Click "Connect Wallet" button
- Approve MetaMask connection
- Ensure you're on the correct network

### 2. Dashboard Overview
- View your HNS balance and token information
- Check airdrop eligibility and claim if available
- Monitor your game token balances

### 3. Game Creation (Admin Only)
- Navigate to "Game Creation" tab
- Enter game parameters (HNS amount, name, symbol, decimals)
- Click "Create Game" and approve transaction

### 4. Activity Points Management
- Set activity points for games (Activity Manager role required)
- Record user activities
- Monitor points earned and redeemed

### 5. Token Operations
- Redeem HNS for game tokens
- Redeem points for game tokens
- Burn game tokens for HNS return

## 🔐 Security Features

- **Role-based Access Control**: Different functions require specific roles
- **Input Validation**: Client-side validation for all inputs
- **Transaction Confirmation**: MetaMask integration for secure transactions
- **Error Handling**: Comprehensive error messages and recovery
- **Loading States**: Visual feedback during transaction processing

## 📱 Responsive Design

The frontend is fully responsive and works on:
- **Desktop**: Full feature access with optimized layout
- **Tablet**: Touch-friendly interface with adapted navigation
- **Mobile**: Streamlined interface for on-the-go access

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Build for Production
```bash
npm run build
```

## 🚀 Deployment

### Build the Application
```bash
npm run build
```

### Deploy to Web Server
Upload the `build` folder to your web server or hosting platform.

### Deploy to IPFS
```bash
npm install -g ipfs-deploy
ipfs-deploy build
```

## 🔗 Integration

### Smart Contract Integration
The frontend integrates with:
- **HNSToken.sol**: HNS token contract with airdrop functionality
- **HNSGameEcosystem.sol**: Main ecosystem contract with all gaming features

### API Integration
- **Blockchain Events**: Real-time event listening
- **MetaMask**: Wallet connection and transaction signing
- **Ethers.js**: Ethereum interaction library

## 📊 Performance

- **Fast Loading**: Optimized bundle size and lazy loading
- **Real-time Updates**: Live blockchain data synchronization
- **Caching**: Smart caching for improved performance
- **Error Recovery**: Graceful error handling and recovery

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- **GitHub Issues**: Create an issue in the repository
- **Documentation**: Check the contract documentation
- **Community**: Join our Discord/Telegram community

## 🔄 Updates

Stay updated with the latest features:
- **GitHub Releases**: Check for new versions
- **Changelog**: Review recent changes
- **Migration Guide**: Follow upgrade instructions

---

**Built with ❤️ for the HNS Gaming Ecosystem** 