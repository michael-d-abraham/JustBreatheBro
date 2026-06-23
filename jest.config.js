module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  watchman: false,
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  // Ambient .d.ts files live alongside tests but are not test suites.
  testPathIgnorePatterns: ['/node_modules/', '\\.d\\.ts$'],
  transform: {
    // TS2367 = "comparison appears unintentional". This suppresses ONLY the
    // pre-existing dead-code comparisons in hooks/useBreathingCycle.ts
    // (documented in docs/BASELINE_STATUS.md, Priority 2) so behavioral tests
    // that import the hook can run. `tsc --noEmit` still reports them as the
    // type-check gate; all other diagnostics remain active.
    '^.+\\.tsx?$': ['ts-jest', { diagnostics: { ignoreCodes: [2367] } }],
    // Audio assets required by hooks resolve to their path string so tests can
    // load the hook and distinguish inhale vs exhale sources.
    '\\.(wav|mp3|m4a|aac|ogg)$': '<rootDir>/jest/wavTransformer.js',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'hooks/**/*.ts',
    'lib/**/*.ts',
    '!**/*.d.ts',
  ],
};

