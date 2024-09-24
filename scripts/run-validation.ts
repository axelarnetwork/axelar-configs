import { readFile, writeFile, unlink } from "fs/promises";
import { execSync } from "child_process";
import path from "path";

const tokenListPath = "registry/mainnet/interchain/squid.tokenlist.json";
const tempFile = "new_tokens.json";

async function cleanup() {
  try {
    await unlink(tempFile);
  } catch {}
}

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

    // Extract new tokens to new_tokens.json
    const newTokens = Object.entries(localTokens)
      .filter(([id]) => !mainTokens[id])
      .reduce((obj, [id, token]) => ({ ...obj, [id]: token }), {});

    await writeFile("new_tokens.json", JSON.stringify(newTokens, null, 2));
  } catch (error) {
    console.error("An error occurred:", error);
    cleanup();
  }

  // Run validation script
  try {
    execSync("bun run scripts/validate-token-configs.ts", { stdio: "inherit" });
  } catch {
  } finally {
    cleanup();
  }
}

main();
