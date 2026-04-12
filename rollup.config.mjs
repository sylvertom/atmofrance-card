import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import json from "@rollup/plugin-json";

export default {
  input: "src/atmofrance-card.ts",
  output: {
    file: "dist/atmofrance-card.js",
    format: "es",
  },
  plugins: [
    json(),
    resolve(),
    typescript(),
    terser(),
  ],
};
