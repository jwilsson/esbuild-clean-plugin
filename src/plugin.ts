import { Plugin } from 'esbuild';
import { CleanPlugin } from './CleanPlugin.js';
import { PluginOptions } from './PluginOptions.js';

export const cleanPlugin = (pluginOptions: PluginOptions = {}): Plugin => ({
    name: 'clean',
    setup(build): void {
        const plugin = new CleanPlugin(pluginOptions, build.initialOptions);

        if (plugin.validateOptions()) {
            plugin.initialClean();

            build.onEnd((result) => {
                plugin.handleBuild(result);
            });
        }
    },
});
