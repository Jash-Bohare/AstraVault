# Astra Vault 🛡️

Astra Vault is a premium, high-fidelity Ethereum wallet designed for developers and enthusiasts who prioritize security, transparency, and a seamless user experience. It serves as both a functional tool and a masterclass in blockchain fundamentals.

---

## 🚀 Key Features

### 🔐 Identity & Account Management
- **BIP-39 Mnemonic Backups**: Securely generate or import 12-word recovery phrases (128-bit entropy).
- **HD Wallet Derivation (BIP-32/BIP-44)**: Manage infinite accounts from a single seed using the standardized Ethereum path: `m/44'/60'/0'/0/${index}`.
- **Multisig-Ready Architecture**: Built on top of `ethers.js v6` for reliable key and address derivation.

### 💸 Transaction & Asset Engine
- **Full Asset Portfolios**: Track Native ETH and custom ERC-20 tokens across networks.
- **Modern Gas Logic (EIP-1559)**: Real-time calculation of Base Fees and Tip Caps for predictable transaction inclusion.
- **Transmission Portal**: Two-stage transaction verification process to prevent accidental broadcasts.
- **Dynamic Asset Discovery**: Import any custom ERC-20 token by simply providing its contract address—Astra Vault handles the metadata fetching automatically.

### ✍️ Signature & Verification Suite
- **EIP-191 Messaging**: Sign human-readable messages to prove ownership of your address without making a transaction.
- **Signature Audit Tool**: Verify external signatures by recovering the signer's address from a message and a hash.
- **Fast-Verify Workflow**: Instantly check your own signatures to verify cryptographic integrity.

### 🛡️ Security Protocol
- **Encryption at Rest**: Sensitive data is never stored in plaintext. All mnemonics and private keys are encrypted using **AES-256-GCM**.
- **PBKDF2 Key Stretching**: Passwords are reinforced with **310,000 iterations** and unique salts to thwart brute-force attacks.
- **Session-Locked Memory**: Decrypted keys exist only in volatile React state and are wiped upon browser refresh or tab closure.
- **Factory Reset**: A built-in "Danger Zone" utility to securely wipe all local data with a single click.

---

## 🛠️ Tech Stack

- **Core**: React 18 / Vite / TypeScript
- **Blockchain**: Ethers.js v6 / BIP39 / @scure/bip32
- **Security**: Web Crypto API (SubtleCrypto)
- **UI/UX**: Tailwind CSS / Framer Motion / Shadcn UI / Radix
- **State Management**: React Context API + TanStack Query
- **Icons**: Lucide React

---

## 🚦 Getting Started

### Prerequisites
- Node.js (v18+)
- Infura API Key (or other RPC provider)

### Installation
1. **Clone the repository**:
   ```bash
   git clone <repo-url>
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Environment Setup**:
   Create a `.env` file in the root based on `.env.example`:
   ```bash
   VITE_INFURA_ID=your_infura_key
   ```
4. **Run Development Server**:
   ```bash
   npm run dev
   ```

---

*Created with focus on security and transparency.*
