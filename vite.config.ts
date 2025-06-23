import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import logoRaizen from '../assets/logo-raizen.png';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
