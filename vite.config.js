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
    build: {
        outDir: '\\\\10.11.33.122\\d$\\khwbpeaiaoi_Shares$\\K18330\\Web\\WB-3OAOITEST',
        emptyOutDir: true, // 打包時清空輸出目錄
    },
})
