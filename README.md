# esbuild-clean-plugin
[![npm](https://img.shields.io/npm/v/esbuild-clean-plugin.svg)](https://www.npmjs.com/package/esbuild-clean-plugin)
[![build](https://github.com/jwilsson/esbuild-clean-plugin/actions/workflows/build.yml/badge.svg)](https://github.com/jwilsson/esbuild-clean-plugin/actions/workflows/build.yml)

An [esbuild](https://esbuild.github.io/) plugin to clean your build folder.

## Installation
```sh
npm install esbuild-clean-plugin
```

### Requirements
* Node 22.11.0 (LTS) or later.
* esbuild 0.18.20 or later.

## Usage
```js
import * as esbuild from 'esbuild';
import { cleanPlugin } from 'esbuild-clean-plugin';
import path from 'path';

const context = await esbuild.context({
  bundle: true,
  entryPoints: [path.resolve(import.meta.dirname, 'index.js')],
  metafile: true,
  outdir: path.resolve(import.meta.dirname, 'dist'),
  plugins: [cleanPlugin({
      // Plugin options
  })],
});

await context.watch();
```

*Note: The `metafile` and `outdir` options must be set for the plugin to have any effect.*

### Options
* `dry` (default `false`) - Run the plugin in dry mode, not deleting anything. Most useful together with the `verbose` option to see what would have been deleted.
* `initialCleanPatterns` (default `['**/*']`) - File patterns to remove on plugin setup, useful to clean the build directory before creating new files. Pass an empty array to disable it.
* `verbose` (default `false`) - Print all files that have been deleted after each run.
