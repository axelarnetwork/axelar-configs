# Add EVM Chain Configuration

This command helps you add a new EVM-compatible blockchain to the Axelar configs registry. It provides an interactive wizard that guides you through the process of creating a chain configuration file.

## Overview

The `add-evm-chain` command creates a standardized configuration file for EVM-compatible blockchains (Ethereum, Polygon, BSC, etc.). This configuration includes essential information needed for applications to interact with the chain, such as RPC endpoints, native currency details, and block explorer information.

## Usage

Run the command from the root of the axelar-configs repository:

```bash
bun wizard
```

Then select "Add an EVM chain config" from the menu.

## Information Required

The wizard will prompt you for the following information:

### Environment

- **Config Kind**: Choose between `mainnet` or `testnet` environment

### Chain Information

- **Chain Name**: The display name of the blockchain (e.g., "Ethereum")
- **Chain ID**: The unique identifier for the chain (e.g., "1" for Ethereum mainnet)
- **Network**: The network identifier (e.g., "ethereum")

### Native Currency Information

- **Native Currency Name**: The full name of the native currency (e.g., "Ether")
- **Native Currency Symbol**: The symbol of the native currency (e.g., "ETH")
- **Native Currency Decimals**: Number of decimal places for the currency (default: "18")

### Network Endpoints

- **RPC URL**: The RPC endpoint URL for the chain
- **Block Explorer Name**: Name of the block explorer (e.g., "Etherscan")
- **Block Explorer URL**: URL of the block explorer (e.g., "https://etherscan.io")

## Output

The command will:

1. Display a draft configuration for review
2. Create a JSON configuration file in the appropriate registry directory:
   - `registry/mainnet/evm/{chain-name}.chain.json` for mainnet
   - `registry/testnet/evm/{chain-name}.chain.json` for testnet

## Configuration Schema

The generated configuration follows the EVM chain schema and includes:

- **$schema**: Reference to the schema file
- **id**: Chain ID as an integer
- **name**: Display name of the chain
- **network**: Network identifier
- **nativeCurrency**: Native currency information
- **rpcUrls**: Array of RPC endpoint URLs
- **blockExplorers**: Array of block explorer configurations
- **testnet**: Boolean indicating if this is a testnet
- **iconUrl**: Path to chain icon (auto-generated)

## Example Configuration

```json
{
  "$schema": "../../schemas/evm-chain.schema.json",
  "id": 1,
  "name": "Ethereum",
  "network": "ethereum",
  "nativeCurrency": {
    "name": "Ether",
    "symbol": "ETH",
    "decimals": 18,
    "iconUrl": "/images/tokens/eth.svg"
  },
  "rpcUrls": ["https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY"],
  "blockExplorers": [
    {
      "name": "Etherscan",
      "url": "https://etherscan.io"
    }
  ],
  "iconUrl": "/images/chains/ethereum.svg",
  "testnet": false
}
```

## Supported EVM Chains

This command can be used to configure various EVM-compatible chains including:

- **Ethereum** (Mainnet, Goerli, Sepolia)
- **Polygon** (Mainnet, Mumbai)
- **Binance Smart Chain** (Mainnet, Testnet)
- **Arbitrum** (One, Nova)
- **Optimism** (Mainnet, Goerli)
- **Avalanche** (C-Chain)
- **Fantom** (Opera)
- **And many more...**

## Notes

- The chain name will be automatically slugified for the filename
- Chain and token icons will be referenced at `/images/chains/{chain-name}.svg` and `/images/tokens/{token-symbol}.svg`
- The configuration will be validated against the EVM chain schema
- Duplicate chain IDs are not allowed within the same environment
- The `testnet` field is automatically set based on the selected environment
- RPC URLs should be HTTPS endpoints for production use
- Multiple RPC URLs can be provided for redundancy
