import { defineConfig } from 'vite';
import { resolve } from 'path';

const entries = { main: 'index.html' };
['src'].forEach ( example => {
    entries[example] = resolve(__dirname, `${example}/index.html`);
});

export default defineConfig({
    base: '/locar.js',
    build: {
        outDir: '../docs',
        rollupOptions: {
            input: entries 
        }
    }
});