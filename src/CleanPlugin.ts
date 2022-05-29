import del from 'del';
import type { BuildOptions, BuildResult } from 'esbuild';
import path from 'node:path';

export type PluginOptions = {
    dry?: boolean;
    initialCleanPatterns?: string[];
    verbose?: boolean;
};

export class CleanPlugin {
    private previousAssets: string[] = [];

    public constructor(
        private pluginOptions: PluginOptions,
        private buildOptions: BuildOptions,
    ) {
        this.pluginOptions = {
            dry: false,
            initialCleanPatterns: ['**/*'],
            verbose: false,
            ...pluginOptions,
        };
    }

    public handleBuild(result: BuildResult): void {
        const { outputs } = result.metafile ?? {};

        if (!outputs) {
            return;
        }

        const outputFiles = Object.keys(outputs);
        const removePatterns = this.previousAssets
            .filter((asset) => {
                return !outputFiles.includes(asset);
            })
            .map((asset) => {
                return path.basename(asset);
            });

        this.previousAssets = outputFiles;

        try {
            this.removeFiles(removePatterns);
        } catch (e: unknown) {
            console.error(`esbuild-clean-plugin: ${e}`);
        }
    }

    public initialClean(): void {
        const { initialCleanPatterns } = this.pluginOptions;

        if (!initialCleanPatterns) {
            return;
        }

        this.removeFiles(initialCleanPatterns);
    }

    protected removeFiles(patterns: string[]): void {
        const { outdir } = this.buildOptions;

        if (!outdir) {
            return;
        }

        const deletedFiles = del.sync(patterns, {
            cwd: path.resolve(process.cwd(), outdir),
            dryRun: Boolean(this.pluginOptions.dry),
        });

        this.printStats(deletedFiles);
    }

    protected printStats(fileNames: string[]): void {
        const { dry, verbose } = this.pluginOptions;
        const { outdir } = this.buildOptions;

        if (!verbose || !outdir) {
            return;
        }

        const message = dry ? 'dry' : 'removed';

        fileNames.forEach((fileName) => {
            fileName = path.resolve(outdir, fileName);

            console.log(`esbuild-clean-plugin: ${message} ${fileName}`);
        });
    }

    public validateOptions(): boolean {
        const { metafile, outdir } = this.buildOptions;

        if (!metafile) {
            console.warn(
                'esbuild-clean-plugin: The esbuild "metafile" option was not set, please set it to true. Stopping.',
            );

            return false;
        }

        if (!outdir) {
            console.warn(
                'esbuild-clean-plugin: The esbuild "outdir" option was not set, please supply it. Stopping.',
            );

            return false;
        }

        return true;
    }
}
