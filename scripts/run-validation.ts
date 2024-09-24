import { readFile } from "fs/promises";
import { execSync, spawnSync } from "child_process";
import path from "path";

const tokenListPath = "registry/mainnet/interchain/squid.tokenlist.json";

async function main() {
  try {
    // Fetching latest changes from main branch
    execSync("git fetch origin main", { stdio: "inherit" });
    const mainContent = execSync(`git show "origin/main":${tokenListPath}`, {
      encoding: "utf-8",
    });
    const mainTokens = JSON.parse(mainContent).tokens;

    // Read local version
    const localContent = await readFile(
      path.join(process.cwd(), tokenListPath),
      "utf8"
    );
    const localTokens = JSON.parse(localContent).tokens;

    // Extract new tokens
    const newTokens = Object.entries(localTokens)
      .filter(([id]) => !mainTokens[id])
      .reduce((obj, [id, token]) => ({ ...obj, [id]: token }), {});

    // Run validation script with new tokens as parameter
    const result = spawnSync(
      "bun",
      ["run", "scripts/validate-token-configs.ts"],
      {
        input: JSON.stringify(newTokens),
        encoding: "utf-8",
        stdio: ["pipe", "inherit", "inherit"],
      }
    );

    if (result.status !== 0) {
      throw new Error(`Validation script exited with status ${result.status}`);
    }

    console.log("All new token configurations are valid.");
  } catch (error) {
    console.error("Validation failed:", (error as Error).message);
    process.exit(1);
  }
}

main();
