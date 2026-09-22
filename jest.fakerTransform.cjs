const ts = require("typescript");

/** Jest does not load ESM in node_modules. Faker 10 ships ESM only. */
module.exports = {
  process(src, filename) {
    const result = ts.transpileModule(src, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
      fileName: filename,
    });
    return { code: result.outputText };
  },
};
