import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const entorno = loadEnv(mode, process.cwd(), "");
  const puertoCliente = Number(entorno.PORT || 3000);
  const puertoApi = Number(entorno.PUERTO_API || 3001);

  return {
    plugins: [react()],
    server: {
      port: puertoCliente,
      proxy: {
        "/api": {
          target: `http://localhost:${puertoApi}`,
          changeOrigin: true
        }
      }
    }
  };
});
