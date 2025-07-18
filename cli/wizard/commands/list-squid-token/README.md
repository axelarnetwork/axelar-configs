# List Squid Token

This command helps you list a new interchain token on [Squid](https://app.squidrouter.com/), the cross-chain token transfer protocol built on Axelar.

## Overview

The `list-squid-token` command automates the process of adding your interchain token to the Axelar configs registry. It fetches token details from the Interchain Token Service (ITS) portal and creates a standardized configuration that can be used by applications to discover and interact with your token across multiple chains.

## Prerequisites

Before running this command, you must:

1. **Fork the Repository**: You must be running this wizard from a forked repository in your own GitHub organization
2. **Register Your Token**: Your token must be registered via the [ITS Portal](https://interchain.axelar.dev/)

## Usage

Run the command from the root of the axelar-configs repository:

```bash
bun wizard
```

Then select "List an interchain token on Squid" from the menu.

## Information Required

The wizard will prompt you for the following information:

### Repository Setup

- **Fork Confirmation**: Confirm that you're running from a forked repository

### Token Registration

- **ITS Portal Registration**: Confirm that your token is registered via the ITS portal

### Token Details

- **Token Details URL**: The URL of your token details from the ITS portal
  - Format: `https://interchain.axelar.dev/{chain}/{token-address}`
  - Example: `https://interchain.axelar.dev/avalanche/0x1234567890abcdef`
- **CoinGecko ID**: The CoinGecko identifier for your token

## Command Flow

### 1. Validation Checks

- Verifies you're running from a forked repository
- Confirms your token is registered via the ITS portal

### 2. Token Information Retrieval

- Extracts the token address and environment from the provided URL
- Makes API calls to fetch token details from the ITS portal:
  - Searches for the token using the token address
  - Retrieves detailed token information including deployment data

### 3. Configuration Generation

- Parses the fetched data into a standardized interchain token configuration
- Displays the generated configuration for review

### 4. File Management

- Saves the configuration to the appropriate token list file:
  - `registry/mainnet/interchain/squid.tokenlist.json` for mainnet
  - `registry/testnet/interchain/squid.tokenlist.json` for testnet
- Creates a placeholder SVG icon file for the token

### 5. Git Operations (Optional)

- Creates a new Git branch with the naming convention: `feat/add-{token-symbol}-token`
- Commits the changes with a descriptive message
- Pushes the branch to your forked repository

## Configuration Schema

The generated configuration follows the interchain token list schema and includes:

- **tokenId**: Unique identifier for the token (hashed)
- **deployer**: Address of the token deployer
- **originalMinter**: Address of the original minter (if applicable)
- **prettySymbol**: Display symbol for the token
- **decimals**: Number of decimal places
- **originAxelarChainId**: The origin chain's Axelar chain ID
- **tokenType**: Type of token (canonical, interchain, customInterchain)
- **iconUrls**: URLs for token icons
- **deploySalt**: Deployment salt used for token creation
- **chains**: Array of chain-specific token information
- **coinGeckoId**: CoinGecko identifier for price data
- **deploymentMessageId**: Axelar message ID for deployment

## Example Configuration

```json
{
  "tokenId": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  "deployer": "0x1234567890abcdef1234567890abcdef12345678",
  "originalMinter": "0x1234567890abcdef1234567890abcdef12345678",
  "prettySymbol": "MYTOKEN",
  "decimals": 18,
  "originAxelarChainId": "avalanche",
  "tokenType": "interchain",
  "iconUrls": {
    "svg": "https://raw.githubusercontent.com/axelarnetwork/axelar-configs/main/images/tokens/mytoken.svg"
  },
  "deploySalt": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  "chains": [
    {
      "symbol": "MYTOKEN",
      "name": "My Token",
      "axelarChainId": "avalanche",
      "tokenAddress": "0x1234567890abcdef1234567890abcdef12345678",
      "tokenManager": "0x1234567890abcdef1234567890abcdef12345678",
      "tokenManagerType": "lockUnlock"
    }
  ],
  "coinGeckoId": "my-token",
  "deploymentMessageId": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
}
```

## Output Files

The command creates/updates the following files:

1. **Token List Configuration**: Updates the appropriate `squid.tokenlist.json` file
2. **Token Icon**: Creates a placeholder SVG icon at `images/tokens/{token-symbol}.svg`
3. **Git Branch**: Creates a feature branch for the changes (if PR creation is selected)

## Notes

- The token address is automatically extracted from the provided URL
- The environment (mainnet/testnet) is determined from the URL
- Duplicate token IDs are not allowed in the same environment
- A placeholder SVG icon is created based on the AXL token icon
- The command validates all data against the interchain token schema
- If API calls fail, the command proceeds with empty data and relies on user input

## Next Steps

After running the command:

1. **Review the Configuration**: Check the generated configuration for accuracy
2. **Update Token Icon**: Replace the placeholder SVG with your actual token icon
3. **Create Pull Request**: If you chose to create a PR, the branch will be ready for submission
4. **Submit for Review**: The PR will be reviewed by the Axelar team for inclusion in the registry

**Note:** You must provide an `*.svg` logo file of the processed token. Sometimes converting from a raster image to SVG (vector image) can cause color issues.If you have trouble with the conversion, try using this [tool](https://www.adobe.com/express/feature/image/convert/jpg-to-svg).
