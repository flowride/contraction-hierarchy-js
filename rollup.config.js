// rollup.config.js
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import typescript from 'rollup-plugin-typescript2';

export default [{
  input: 'main.ts',
  output: {
    file: 'dist/ch-script.js',
    format: 'iife',
    name: 'contractionHierarchy'
  },
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      useTsconfigDeclarationDir: true
    }),
    nodeResolve(),
    commonjs()
  ]
}, {
  input: 'main.ts',
  output: {
    file: 'dist/ch-umd.js',
    format: 'umd',
    name: 'contractionHierarchy'
  },
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      useTsconfigDeclarationDir: true
    }),
    nodeResolve(),
    commonjs()
  ]
}, {
  input: 'main.ts',
  output: {
    file: 'dist/ch-umd.min.js',
    format: 'umd',
    name: 'contractionHierarchy'
  },
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      useTsconfigDeclarationDir: true
    }),
    nodeResolve(),
    commonjs(),
    terser()
  ]
}];