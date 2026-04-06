import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export const RUTA_CARPETA_DATOS = path.join(process.cwd(), "datos");
export const RUTA_CACHE = path.join(RUTA_CARPETA_DATOS, "cache-categorias.json");

function asegurarCarpetaDatos() {
  if (!fs.existsSync(RUTA_CARPETA_DATOS)) {
    fs.mkdirSync(RUTA_CARPETA_DATOS, { recursive: true });
  }
}

export function crearClaveCliente(cliente) {
  return `${cliente.correoElectronico.toLowerCase()}__${cliente.fechaReunion}`;
}

export function calcularHuellaTexto(texto) {
  return crypto.createHash("sha256").update(texto || "").digest("hex");
}

export function cargarCacheCategorias() {
  asegurarCarpetaDatos();

  if (!fs.existsSync(RUTA_CACHE)) {
    return {};
  }

  try {
    const contenido = fs.readFileSync(RUTA_CACHE, "utf8");
    return JSON.parse(contenido);
  } catch {
    return {};
  }
}

export function guardarCacheCategorias(cache) {
  asegurarCarpetaDatos();
  fs.writeFileSync(RUTA_CACHE, JSON.stringify(cache, null, 2), "utf8");
}
