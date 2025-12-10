import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
      sourcemap: true
    },
    server: {
      host: true
    },
    define: {
      // This ensures code using process.env.API_KEY works in the browser.
      // It checks for VITE_API_KEY first, then API_KEY, then falls back to the provided key.
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY || env.API_KEY || "AIzaSyAFn28L_JCTG59MHZ8sauQjH-ZxLT1BuOA")
    }
  };
});