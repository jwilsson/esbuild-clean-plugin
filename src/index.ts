import { Plugin } from 'esbuild';
import { CleanPlugin, PluginOptions } from './CleanPlugin.js';

export { type PluginOptions } from './CleanPlugin.js';

export const cleanPlugin = (pluginOptions: PluginOptions = {}): Plugin => {
    return {
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
    };
};
