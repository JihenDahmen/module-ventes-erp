import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@core': path.resolve(__dirname, './src/modules/core'),
            '@sales': path.resolve(__dirname, './src/modules/sales'),
        },
    },
    server: {
        port: 5173,
        proxy: {
            '/api/quotes': {
                target: 'http://localhost:4000',
                changeOrigin: true
            },
            '/api/orders': {
                target: 'http://localhost:4000',
                changeOrigin: true
            },
            '/api/factures': {
                target: 'http://localhost:5000',
                changeOrigin: true
            },
            '/api/clients': {
                target: 'http://localhost:5000',
                changeOrigin: true
            },
            '/api/produits': {
                target: 'http://localhost:5000',
                changeOrigin: true
            },
            '/api/paiements': {
                target: 'http://localhost:5000',
                changeOrigin: true
            },
            '/api/dashboard': {
                target: 'http://localhost:5000',
                changeOrigin: true
            },
            '/api/report': {
                target: 'http://localhost:5000',
                changeOrigin: true
            },
            '/api/deliveries': {
                target: 'http://localhost:3000',
                changeOrigin: true
            },
            '/api/retours': {
                target: 'http://localhost:5000',
                changeOrigin: true
            },
            '/api/avoirs': {
                target: 'http://localhost:5000',
                changeOrigin: true
            }
        }
    }
})
