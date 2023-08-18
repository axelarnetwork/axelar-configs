import { fs, globby } from "zx";

const networkKind = ["evm", "cosmos"];
const envKind = ["mainnet", "testnet"];

for (const network of networkKind) {
  for (const env of envKind) {
    const chainConfigFiles = await globby(
      `registry/${env}/${network}/*.chain.json`
    );

    const chains = chainConfigFiles.map((chainConfigFile) => {
      const { $schema, ...chainConfig } = fs.readJsonSync(chainConfigFile);

      return chainConfig;
    });

    const chainsInputFile = {
      $schema: `../../schemas/${network}-chains.schema.json`,
      timestamp: new Date().toISOString(),
      chains,
    };

    await fs.writeJson(
      `registry/${env}/${network}/generated.chains.json`,
      chainsInputFile,
      { spaces: 2 }
    );
  }
}
