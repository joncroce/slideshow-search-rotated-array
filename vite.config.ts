import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [svelte()],
	resolve: {
		alias: {
			'@components': path.resolve(__dirname, './src/lib/components/index.ts'),
			'@config': path.resolve(__dirname, './src/config.ts'),
			'@constants': path.resolve(__dirname, './src/lib/constants/index.ts'),
			'@languages': path.resolve(__dirname, './src/lib/languages/index.ts'),
			'@lib': path.resolve(__dirname, './src/lib'),
			'@stores': path.resolve(__dirname, './src/lib/stores'),
			'@styles': path.resolve(__dirname, './src/lib/styles'),
			'@utils': path.resolve(__dirname, './src/lib/utils'),
		},
	},
});
