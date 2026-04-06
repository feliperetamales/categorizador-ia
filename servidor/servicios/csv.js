import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";

export const RUTA_CSV = path.join(process.cwd(), "vambe_clients.csv");

function limpiarTexto(valor) {
  return String(valor || "").trim();
}

function crearIdCliente(fila, indice) {
  const correo = limpiarTexto(fila["Correo Electronico"] || `cliente-${indice + 1}`).toLowerCase();
  const fecha = limpiarTexto(fila["Fecha de la Reunion"] || "sin-fecha");

  return `${correo}-${fecha}`.replace(/[^a-z0-9@._-]/gi, "-");
}

export function leerClientesDesdeCsv(rutaArchivo = RUTA_CSV) {
  const contenido = fs.readFileSync(rutaArchivo, "utf8");
  const filas = parse(contenido, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });

  return filas.map((fila, indice) => ({
    id: crearIdCliente(fila, indice),
    nombre: limpiarTexto(fila["Nombre"]),
    correoElectronico: limpiarTexto(fila["Correo Electronico"]),
    numeroTelefono: limpiarTexto(fila["Numero de Telefono"]),
    fechaReunion: limpiarTexto(fila["Fecha de la Reunion"]),
    vendedorAsignado: limpiarTexto(fila["Vendedor asignado"]),
    cerrado: limpiarTexto(fila.closed) === "1",
    transcripcion: limpiarTexto(fila.Transcripcion)
  }));
}
