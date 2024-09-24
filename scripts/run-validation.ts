import { readFile, writeFile } from "fs/promises";
import { execSync } from "child_process";
import path from "path";

const tokenListPath = "registry/mainnet/interchain/squid.tokenlist.json";

async function getFileContent(
  filePath: string,
  ref: string = "HEAD"
): Promise<string> {
  try {
    return execSync(`git show ${ref}:${filePath}`, { encoding: "utf-8" });
  } catch (error) {
    console.error(`Error reading file from git: ${error}`);
    return "";
  }
}

async function main() {
  try {
    // Fetching latest changes from main branch
    execSync("git fetch origin main", { stdio: "inherit" });
    const mainContent = await getFileContent(tokenListPath, "origin/main");
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
  }
  // Run validation script
  try {
    execSync("bun run scripts/validate-token-configs.js", { stdio: "inherit" });
  } catch {}

  // Check for validation errors
  try {
    await readFile("validation_errors.txt", "utf8");
    console.error(
      "Validation errors found. Check validation_errors.txt for details."
    );
    process.exit(1);
  } catch {
    console.log("All new token configurations are valid.");
  }
}

main();
