import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("./index.html", import.meta.url)),
        admin: fileURLToPath(new URL("./admin.html", import.meta.url)),
        dashboard: fileURLToPath(
          new URL("./dashboard.html", import.meta.url)
        ),
        resetPassword: fileURLToPath(
          new URL("./reset-password.html", import.meta.url)
        ),
        productDetails: fileURLToPath(
          new URL("./product-details.html", import.meta.url)
        ),
      },
    },
  },
});