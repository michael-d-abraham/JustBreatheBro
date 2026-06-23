// Jest transformer for audio asset files.
// The hook requires .wav files at module load; under ts-jest these would be
// parsed as JS and fail. This returns the asset's absolute path as a string so
// tests can both load the hook and distinguish inhale vs exhale sources.
module.exports = {
  process(_src, filename) {
    return { code: `module.exports = ${JSON.stringify(filename)};` };
  },
};
