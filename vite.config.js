import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
    base: './',
    plugins: [
        react(),
        viteCompression()
    ],
    server: {
        port: 3000, // port 指定為 3000
    },
})
