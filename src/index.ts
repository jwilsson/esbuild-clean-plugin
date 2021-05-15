import { Plugin } from 'esbuild';

import { CleanPlugin, PluginOptions } from './CleanPlugin.js';

export { PluginOptions } from './CleanPlugin.js';

export const cleanPlugin = (pluginOptions: PluginOptions = {}): Plugin => {
    return {
        name: 'clean',
        setup(build) {
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
