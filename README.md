# Astra Vault Wallet

Astra Vault is a premium, high-fidelity Ethereum wallet designed for a seamless and professional user experience. 

## Features

- **Standardized UI**: Clean, professional terminology and typography.
- **Secure by Design**: Sensitive data like private keys and mnemonics are stored in memory and encrypted.
- **Multi-Account Support**: Easily derive and manage multiple accounts from a single mnemonic.
- **Token Management**: Track your assets across different networks with easy token importing.
- **Premium Aesthetics**: Vibrant glassmorphism design with smooth, subtle micro-animations.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or bun

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Copy `.env.example` to `.env` and add your Infura API key:
   ```bash
   VITE_INFURA_ID=your_infura_id_here
   ```

### Development

Run the development server:
```bash
npm run dev
```

### Building for Production

Build the production bundle:
```bash
npm run build
```

## Technologies Used

- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS & Vanilla CSS
- **Components**: shadcn/ui & Radix UI
- **Icons**: Lucide React
- **Blockchain Interface**: Ethers.js (v6)
- **State Management**: React Context API & React Query
