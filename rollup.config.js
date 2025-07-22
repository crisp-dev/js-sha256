/*
 * This file is part of js-sha256
 *
 * Copyright (c) 2025 Chen, Yi-Cyuan
 * All rights belong to Chen, Yi-Cyuan
 */

/**************************************************************************
 * IMPORTS
 ***************************************************************************/

// NPM

import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";

// Common plugins configuration
const basePlugins = [
  // Resolve dependencies
  resolve({
    browser: true
  }),

  // Convert CommonJS modules
  commonjs(),

  // Minify and enable tree shaking
  terser({
    compress: {
      passes: 2,
      dead_code: true,
      drop_console: true
    },
    format: {
      comments: false
    }
  })
];

// Build configurations for different formats
export default [
  // IIFE build (for direct browser usage)
  {
    input: "src/sha256.js",
    output: {
      file: "dist/sha256.iife.js",
      format: "iife",
      name: 'sha256',
      sourcemap: true
    },
    plugins: basePlugins,
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false
    }
  },

  // ESM build (for modern bundlers)
  {
    input: "src/sha256.js",
    output: {
      file: "dist/sha256.esm.js",
      format: "esm",
      sourcemap: true
    },
    plugins: basePlugins,
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false
    }
  },

  // CommonJS build (for Node.js)
  {
    input: "src/sha256.js",
    output: {
      file: "dist/sha256.cjs.js",
      format: "cjs",
      sourcemap: true
    },
    plugins: basePlugins,
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false
    }
  }
]; 