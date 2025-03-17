import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    base: 'ar_v2/', // Ensure this matches your GitHub Pages URL
    build: {
        outDir: '../docs/ar_v2',
        rollupOptions: {
            input: { main: 'index.html' }
        }
    }
});
