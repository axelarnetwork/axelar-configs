# Add Cosmos Chain Configuration

This command helps you add a new Cosmos-based blockchain to the Axelar configs registry. It provides an interactive wizard that guides you through the process of creating a chain configuration file.

## Overview

The `add-cosmos-chain` command creates a standardized configuration file for Cosmos SDK-based blockchains. This configuration includes essential information needed for applications to interact with the chain, such as RPC endpoints, chain metadata, and supported features.

## Usage

Run the command from the root of the axelar-configs repository:

```bash
bun wizard
```

Then select "Add a Cosmos chain config" from the menu.

## Information Required

The wizard will prompt you for the following information:

### Environment

- **Config Kind**: Choose between `mainnet` or `testnet` environment

### Chain Information

- **Chain Name**: The display name of the blockchain (e.g., "Cosmos Hub")
- **Chain ID**: The unique identifier for the chain (e.g., "cosmoshub-4")
- **RPC Endpoint**: The RPC URL for the chain (default port: 26657)
- **REST Endpoint**: The REST/API URL for the chain (default port: 1317)

### Staking Token Information

- **Staking Token Name**: The full name of the staking token (e.g., "Cosmos")
- **Staking Token Symbol**: The symbol of the staking token (e.g., "ATOM")
- **Staking Token Decimals**: Number of decimal places for the token (e.g., "6")

### Address Configuration

- **BIP44 Coin Type**: The BIP44 coin type for address derivation (e.g., "118")
- **Bech32 Prefix**: The address prefix for the chain (e.g., "cosmos")

### Additional Information

- **Staking Interface URL**: URL for the staking interface frontend
- **Chain Features**: Select from available features:
  - IBC transfers
  - Stargate
  - CosmWasm
  - Authz
  - Fee Grant

## Output

The command will:

1. Display a draft configuration for review
2. Create a JSON configuration file in the appropriate registry directory:
   - `registry/mainnet/cosmos/{chain-name}.chain.json` for mainnet
   - `registry/testnet/cosmos/{chain-name}.chain.json` for testnet

## Configuration Schema

The generated configuration follows the Cosmos chain schema and includes:

- **$schema**: Reference to the schema file
- **rpc**: RPC endpoint URL
- **rest**: REST endpoint URL
- **chainId**: Unique chain identifier
- **chainName**: Display name
- **chainIconUrl**: Path to chain icon (auto-generated)
- **stakeCurrency**: Staking token information
- **currencies**: List of supported currencies
- **feeCurrencies**: List of fee currencies
- **bip44**: BIP44 coin type configuration
- **bech32Config**: Bech32 address prefix configuration
- **features**: Array of supported features
- **walletUrlForStaking**: Staking interface URL

## Example Configuration

```json
{
  "$schema": "../../schemas/cosmos-chain.schema.json",
  "rpc": "https://rpc.cosmos.network:26657",
  "rest": "https://api.cosmos.network:1317",
  "chainId": "cosmoshub-4",
  "chainName": "Cosmos Hub",
  "chainIconUrl": "/images/chains/cosmos-hub.svg",
  "stakeCurrency": {
    "coinDenom": "ATOM",
    "coinMinimalDenom": "uatom",
    "coinDecimals": 6
  },
  "currencies": [
    {
      "coinDenom": "ATOM",
      "coinMinimalDenom": "uatom",
      "coinDecimals": 6
    }
  ],
  "feeCurrencies": [
    {
      "coinDenom": "ATOM",
      "coinMinimalDenom": "uatom",
      "coinDecimals": 6
    }
  ],
  "bip44": {
    "coinType": 118
  },
  "bech32Config": {
    "bech32PrefixAccAddr": "cosmos",
    "bech32PrefixAccPub": "cosmospub",
    "bech32PrefixValAddr": "cosmosvaloper",
    "bech32PrefixValPub": "cosmosvaloperpub",
    "bech32PrefixConsAddr": "cosmosvalcons",
    "bech32PrefixConsPub": "cosmosvalconspub"
  },
  "features": ["ibc-transfer", "stargate"],
  "walletUrlForStaking": "https://wallet.keplr.app/chains/cosmos-hub"
}
```

## Notes

- The chain name will be automatically slugified for the filename
- Chain and token icons will be referenced at `/images/chains/{chain-name}.svg` and `/images/tokens/{token-symbol}.svg`
- The configuration will be validated against the Cosmos chain schema
- Duplicate chain IDs are not allowed within the same environment
