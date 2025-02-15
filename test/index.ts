import { jest } from '@jest/globals';
import * as esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import { temporaryDirectory } from 'tempy';
import { cleanPlugin, PluginOptions } from '../src/index.ts';

const getOutputFiles = (filePath: string): string[] => fs.readdirSync(filePath);

const filesExists = (filePath: string, fileNames: string[]): boolean =>
    fileNames.every((fileName) => {
        fileName = path.resolve(filePath, fileName);

        return fs.existsSync(fileName);
    });

const writeFile = (filePath: string, fileName: string, data = ''): void => {
    fileName = path.resolve(filePath, fileName);

    fs.writeFileSync(fileName, data);
};

const setupContext = (
    buildOptions: esbuild.BuildOptions = {},
    pluginOptions?: PluginOptions,
): Promise<esbuild.BuildContext> =>
    esbuild.context({
        metafile: true,
        plugins: [cleanPlugin(pluginOptions)],
        ...buildOptions,
    });

const fixtures = ['original.js', 'original.css'];

describe('esbuild-clean-plugin', () => {
    let context: esbuild.BuildContext;
    let entryDir: string;
    let outDir: string;

    beforeEach(() => {
        jest.resetAllMocks();

        entryDir = temporaryDirectory();
        outDir = temporaryDirectory();

        writeFile(entryDir, 'a.js');

        fixtures.forEach((fixture) => {
            writeFile(outDir, fixture);
        });
    });

    afterEach(async () => {
        await context.dispose();
    });

    test('Deletes stale files on each run', async () => {
        context = await setupContext({
            entryNames: '[hash]',
            entryPoints: [path.resolve(entryDir, 'a.js')],
            outdir: outDir,
        });

        writeFile(entryDir, 'a.js', 'const foo = true;');

        const buildResult = await context.rebuild();
        const initialFileName = path.basename(Object.keys(buildResult.metafile?.outputs ?? [])[0] ?? '');

        await context.watch();

        writeFile(entryDir, 'a.js', 'const foo = false;');

        await context.dispose();

        expect(getOutputFiles(outDir).length).toBe(1);
        expect(filesExists(outDir, [initialFileName])).toBe(false);
    });

    test('Deletes files in initialCleanPatterns', async () => {
        context = await setupContext({
            entryPoints: [path.resolve(entryDir, 'a.js')],
            outdir: outDir,
        });

        await context.rebuild();

        expect(filesExists(outDir, fixtures)).toBe(false);
    });

    test("Doesn't delete anything if initialCleanPatterns is empty", async () => {
        context = await setupContext(
            {
                entryPoints: [path.resolve(entryDir, 'a.js')],
                outdir: outDir,
            },
            {
                initialCleanPatterns: [],
            },
        );

        await context.rebuild();

        expect(filesExists(outDir, fixtures)).toBe(true);
    });

    test("Doesn't delete files in dry mode", async () => {
        context = await setupContext(
            {
                entryPoints: [path.resolve(entryDir, 'a.js')],
                outdir: outDir,
            },
            {
                dry: true,
            },
        );

        await context.rebuild();

        expect(filesExists(outDir, fixtures)).toBe(true);
    });

    test('Print stats in verbose mode', async () => {
        const consoleSpy = jest.spyOn(global.console, 'log').mockImplementation(jest.fn());

        context = await setupContext(
            {
                entryPoints: [path.resolve(entryDir, 'a.js')],
                outdir: outDir,
            },
            {
                verbose: true,
            },
        );

        await context.rebuild();

        expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching('esbuild-clean-plugin: removed'));
    });

    test("Stops if 'metafile' option isn't supplied", async () => {
        const consoleSpy = jest.spyOn(global.console, 'warn').mockImplementation(jest.fn());

        context = await setupContext({
            entryPoints: [path.resolve(entryDir, 'a.js')],
            metafile: false,
            outdir: outDir,
        });

        await context.rebuild();

        expect(filesExists(outDir, fixtures)).toBe(true);
        expect(consoleSpy).toHaveBeenCalledWith(
            expect.stringMatching(
                'esbuild-clean-plugin: The esbuild "metafile" option was not set, please set it to true. Stopping.',
            ),
        );
    });

    test("Stops if 'outdir' option isn't supplied", async () => {
        const consoleSpy = jest.spyOn(global.console, 'warn').mockImplementation(jest.fn());

        context = await setupContext({
            entryPoints: [path.resolve(entryDir, 'a.js')],
            outdir: '',
        });

        await context.rebuild();

        expect(filesExists(outDir, fixtures)).toBe(true);
        expect(consoleSpy).toHaveBeenCalledWith(
            expect.stringMatching(
                'esbuild-clean-plugin: The esbuild "outdir" option was not set, please supply it. Stopping.',
            ),
        );
    });
});
