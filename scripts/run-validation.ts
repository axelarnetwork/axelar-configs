import { readFile } from "fs/promises";
import { execSync, spawn } from "child_process";
import path from "path";

const tokenListPath = "registry/mainnet/interchain/squid.tokenlist.json";

async function main() {
  try {
    // Fetch latest changes from main branch
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
    const validationProcess = spawn(
      "bun",
      ["run", "scripts/validate-token-configs.ts"],
      { stdio: ["pipe", "inherit", "inherit"] }
    );

    validationProcess.stdin.setDefaultEncoding("utf-8");
    validationProcess.stdin.write(JSON.stringify(newTokens));
    validationProcess.stdin.end();

    await new Promise((resolve, reject) => {
      validationProcess.on("close", (code) => {
        if (code === 0) {
          console.log("All new token configurations are valid.");
          resolve(null);
        } else {
          reject(new Error(`Validation script exited with status ${code}`));
        }
      });

      validationProcess.on("error", (error) => {
        reject(new Error(`Validation process error: ${error.message}`));
      });
    });
  } catch (error) {
    console.error("Validation failed:", (error as Error).message);
    process.exit(1);
  }
}

main();
