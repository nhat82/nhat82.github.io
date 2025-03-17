import { defineConfig } from 'vite';
import { resolve } from 'path';

const entries = { main: 'index.html' };

export default defineConfig({
    base: '/ar_v2/',  // Set this to match the GitHub Pages deployment URL
    build: {
        outDir: '../docs/ar_v2', // Ensure files are output correctly
        rollupOptions: {
            input: entries
        }
    }
});
