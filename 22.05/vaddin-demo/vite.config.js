import { defineConfig } from "vite";

export default defineConfig({
  server: {
    hmr: {
      protocol: "fdsafdsa",// 随便写错，使得实时更新失效。
    },
    proxy: {
      "/api": {
        target: "https://frank-words.netlify.app",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      }
    }
  }
})