# Axelar configs

A public registry for chains and asset configurations for applications built on the Axelar network.

## Getting started

Before we begin, make sure your system has the minimum runtime requirements:

- [git](https://git-scm.com/downloads)
- [bun](https://bun.sh/) >= 1.0 OR [npm](https://docs.npmjs.com/)

To install `bun`, run the following command:

```bash
curl -fsSL https://bun.sh/install | bash
```

Once you have `bun` or `nodejs` installed, you can clone this repository:

```bash
git clone git@github.com:axelarnetwork/axelar-configs.git
```

cd into the folder

```bash
cd axelar-configs
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
- [Add a Cosmos chain config](cli/wizard/commands/add-cosmos-chain/README.md)
- [Add a EVM chain config](cli/wizard/commands/add-evm-chain/README.md)
