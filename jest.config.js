import { createDefaultEsmPreset } from 'ts-jest';

const presetConfig = createDefaultEsmPreset({
    tsconfig: 'tsconfig.spec.json',
});

export default {
    ...presetConfig,
    collectCoverage: true,
    moduleNameMapper: {
        './CleanPlugin.js': './CleanPlugin.ts',
        './plugin.js': './plugin.ts',
    },
    testEnvironment: 'node',
    testMatch: ['<rootDir>/test/**/*.ts'],
    verbose: true,
};
