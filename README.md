# public-chain-configs

A public registry for chains and asset configurations

## Getting started

Before we begin, make sure your system has the minimum runtime requirements:

- [git](https://git-scm.com/downloads)
- [bun](https://bun.sh/) >= 1.0

To install `bun`, run the following command:

```bash
curl -fsSL https://bun.sh/install | bash
```

Once you have `nodejs` and `bun`, you can clone this repository:

```bash
git clone git@github.com:axelarnetwork/public-chain-configs.git
```

cd into the folder

```bash
cd public-chain-configs
```

Install dependencies

```bash
bun i
```

You're all set 🎉

### Running the wizard

```bash
bun wizard
```

or

```bash
pnpm wizard
```

or

```bash
npm run wizard
```

The wizard currently allows you to:

- [List an interchain token on Squid](/cli/wizard/commands/list-squid-token/README.md)
- Add a Cosmos/EVM chain config
- Add a Cosmos/EVM asset list config
- more to come...

### Registering a new EVM chain

`coming soon...`

### Registering a new Cosmos chain

`coming soon...`

### Registering a EVM Token Lists

`Token Lists` is a standard for lists of ERC20 tokens within the Ethereum ecosystem. It aids in the discoverability of tokens by mapping ERC20 contracts to their associated metadata, such as token name, symbol, and logo. The lists are community-maintained and serve as a single source of truth for token metadata, ensuring a consistent experience across different platforms and applications.

### Registering a Cosmos Asset List

`Cosmos Asset Lists` is a standard inspired by the Ethereum Token Lists project, tailored for the Cosmos ecosystem. It provides a mechanism for user interfaces to fetch metadata associated with Cosmos SDK denominations, especially for assets sent over IBC (Inter-Blockchain Communication). The lists help in the discoverability of assets by mapping them to their metadata, ensuring a consistent and unified representation across different platforms within the Cosmos ecosystem.
