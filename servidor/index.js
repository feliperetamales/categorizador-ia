import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import express from "express";
import { obtenerDashboard, procesarClientesConIA } from "./servicios/clientes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rutaDist = path.join(__dirname, "..", "dist");
const app = express();
const enDesarrollo = process.argv.includes("--desarrollo");
const puerto = enDesarrollo ? Number(process.env.PUERTO_API || 3001) : Number(process.env.PORT || 3000);
const hayFrontendCompilado = fs.existsSync(rutaDist);

app.use(express.json());

app.get("/api/salud", (_request, response) => {
  response.json({
    ok: true,
    servicio: "panel-vambe",
    fecha: new Date().toISOString()
  });
});

app.get("/api/dashboard", async (_request, response) => {
  try {
    const resultado = await obtenerDashboard();
    response.json(resultado);
  } catch (error) {
    response.status(500).json({
      error: "No se pudo cargar el dashboard.",
      detalle: error.message
    });
  }
});

app.post("/api/procesar", async (request, response) => {
  try {
    const forzar = Boolean(request.body?.forzar);
    const modelo = request.body?.modelo;
    const resultado = await procesarClientesConIA({ forzar, modelo });
    response.json(resultado);
  } catch (error) {
    response.status(500).json({
      error: "No se pudo procesar la informacion con OpenAI.",
      detalle: error.message
    });
  }
});

if (hayFrontendCompilado) {
  app.use(express.static(rutaDist));

  app.get("*", (request, response) => {
    if (request.path.startsWith("/api")) {
      response.status(404).json({ error: "Ruta no encontrada." });
      return;
    }

    response.sendFile(path.join(rutaDist, "index.html"));
  });
} else {
  app.get("/", (_request, response) => {
    response.json({
      mensaje: "API del panel lista. Para el frontend en desarrollo usa Vite."
    });
  });
}

app.listen(puerto, () => {
  console.log(`Servidor listo en http://localhost:${puerto}`);
});


