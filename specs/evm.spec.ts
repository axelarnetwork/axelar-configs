import { test, describe, expect } from "vitest";
import { globby } from "zx";
import { validate } from "jsonschema";

const files = await globby("registry/**/evm/*chain.json");
const schema = await import("../registry/evm-chain.schema.json");

describe("EVM Chain Configs", async () => {
  for (const file of files) {
    test(`${file} should match the schema`, async () => {
      const { default: config } = await import(`../${file}`);

      const result = validate(config, schema);

      expect(result.valid).toBe(true);
    });
  }
});
