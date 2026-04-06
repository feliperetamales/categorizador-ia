import { useState } from "react";
import { formatearFecha, obtenerEtiquetaCategoria } from "../utilidades";

const ORDEN_INICIAL = {
  columna: "",
  direccion: "asc"
};

const PRIORIDAD_URGENCIA = {
  baja: 1,
  media: 2,
  alta: 3
};

const PRIORIDAD_INTEGRACION = {
  no_mencionado: 1,
  no: 2,
  si: 3
};

const PRIORIDAD_VOLUMEN = {
  no_mencionado: 1,
  bajo: 2,
  medio: 3,
  alto: 4
};

const PRIORIDAD_SENAL = {
  baja: 1,
  media: 2,
  alta: 3
};

const COLUMNAS_ORDENABLES = [
  { clave: "cliente", etiqueta: "Cliente" },
  { clave: "vendedor", etiqueta: "Vendedor" },
  { clave: "fecha", etiqueta: "Fecha" },
  { clave: "telefono", etiqueta: "Telefono" },
  { clave: "estado", etiqueta: "Estado" },
  { clave: "industria", etiqueta: "Industria" },
  { clave: "canal", etiqueta: "Canal" },
  { clave: "dolor", etiqueta: "Dolor" },
  { clave: "necesidad", etiqueta: "Necesidad" },
  { clave: "urgencia", etiqueta: "Urgencia" },
  { clave: "volumen", etiqueta: "Volumen" },
  { clave: "integracion", etiqueta: "Integracion" },
  { clave: "riesgo", etiqueta: "Riesgo" },
  { clave: "senal", etiqueta: "Senal" },
  { clave: "proximaAccion", etiqueta: "Proxima accion" },
  { clave: "resumen", etiqueta: "Resumen" }
];

function EtiquetaEstado({ cliente }) {
  return (
    <span className={`etiqueta ${cliente.cerrado ? "etiqueta--cerrado" : "etiqueta--abierto"}`}>
      {cliente.cerrado ? "Cerrado" : "Abierto"}
    </span>
  );
}

function crearEnlaceWhatsApp(numeroTelefono) {
  const numeroLimpio = String(numeroTelefono || "").replace(/\D/g, "");

  if (!numeroLimpio) {
    return "";
  }

  return `https://wa.me/${numeroLimpio}`;
}

function obtenerTextoCategoria(cliente, campo) {
  if (!cliente.categoria) {
    return "Sin procesar";
  }

  return obtenerEtiquetaCategoria(campo, cliente.categoria[campo]);
}

function obtenerValorOrden(cliente, columna) {
  switch (columna) {
    case "cliente":
      return `${cliente.nombre || ""} ${cliente.correoElectronico || ""}`;
    case "vendedor":
      return cliente.vendedorAsignado || "";
    case "fecha": {
      if (!cliente.fechaReunion) {
        return 0;
      }

      const fecha = new Date(`${cliente.fechaReunion}T00:00:00`).getTime();
      return Number.isNaN(fecha) ? 0 : fecha;
    }
    case "telefono":
      return cliente.numeroTelefono || "";
    case "estado":
      return cliente.cerrado ? 2 : 1;
    case "industria":
      return cliente.categoria?.industria || "";
    case "canal":
      return obtenerTextoCategoria(cliente, "canalDescubrimiento");
    case "dolor":
      return obtenerTextoCategoria(cliente, "dolorPrincipal");
    case "necesidad":
      return obtenerTextoCategoria(cliente, "necesidadClave");
    case "urgencia":
      return PRIORIDAD_URGENCIA[cliente.categoria?.nivelUrgencia] || 0;
    case "volumen":
      return PRIORIDAD_VOLUMEN[cliente.categoria?.nivelVolumen] || 0;
    case "integracion":
      return PRIORIDAD_INTEGRACION[cliente.categoria?.requiereIntegracion] || 0;
    case "riesgo":
      return obtenerTextoCategoria(cliente, "riesgoPrincipal");
    case "senal":
      return PRIORIDAD_SENAL[cliente.categoria?.senalCompra] || 0;
    case "proximaAccion":
      return obtenerTextoCategoria(cliente, "proximaAccion");
    case "resumen":
      return cliente.categoria?.resumen || "";
    default:
      return "";
  }
}

function compararValores(valorA, valorB, direccion) {
  const factor = direccion === "asc" ? 1 : -1;

  if (typeof valorA === "number" && typeof valorB === "number") {
    return (valorA - valorB) * factor;
  }

  return (
    String(valorA).localeCompare(String(valorB), "es", {
      sensitivity: "base"
    }) * factor
  );
}

function ordenarClientes(clientes, orden) {
  if (!orden.columna) {
    return clientes;
  }

  return [...clientes].sort((clienteA, clienteB) => {
    const valorA = obtenerValorOrden(clienteA, orden.columna);
    const valorB = obtenerValorOrden(clienteB, orden.columna);
    const comparacion = compararValores(valorA, valorB, orden.direccion);

    if (comparacion !== 0) {
      return comparacion;
    }

    return String(clienteA.nombre || "").localeCompare(String(clienteB.nombre || ""), "es", {
      sensitivity: "base"
    });
  });
}

function filtrarClientesTabla(clientes, busqueda) {
  const textoBusqueda = busqueda.trim().toLowerCase();

  if (!textoBusqueda) {
    return clientes;
  }

  return clientes.filter((cliente) => {
    const textoFila = [
      cliente.nombre,
      cliente.correoElectronico,
      cliente.numeroTelefono,
      cliente.vendedorAsignado,
      cliente.categoria?.industria,
      obtenerTextoCategoria(cliente, "canalDescubrimiento"),
      obtenerTextoCategoria(cliente, "dolorPrincipal"),
      obtenerTextoCategoria(cliente, "necesidadClave"),
      obtenerTextoCategoria(cliente, "nivelUrgencia"),
      obtenerTextoCategoria(cliente, "nivelVolumen"),
      obtenerTextoCategoria(cliente, "requiereIntegracion"),
      obtenerTextoCategoria(cliente, "riesgoPrincipal"),
      obtenerTextoCategoria(cliente, "senalCompra"),
      obtenerTextoCategoria(cliente, "proximaAccion"),
      cliente.categoria?.resumen
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return textoFila.includes(textoBusqueda);
  });
}

export default function TablaClientes({ clientes }) {
  const [orden, setOrden] = useState(ORDEN_INICIAL);
  const [busqueda, setBusqueda] = useState("");

  const clientesFiltrados = filtrarClientesTabla(clientes, busqueda);
  const clientesOrdenados = ordenarClientes(clientesFiltrados, orden);

  function cambiarOrden(columna) {
    setOrden((ordenActual) => {
      if (ordenActual.columna === columna) {
        return {
          columna,
          direccion: ordenActual.direccion === "asc" ? "desc" : "asc"
        };
      }

      return {
        columna,
        direccion: "asc"
      };
    });
  }

  function obtenerIndicador(columna) {
    if (orden.columna !== columna) {
      return "-";
    }

    return orden.direccion === "asc" ? "^" : "v";
  }

  function claseBotonOrden(columna) {
    return orden.columna === columna
      ? "tabla-clientes__orden-boton tabla-clientes__orden-boton--activo"
      : "tabla-clientes__orden-boton";
  }

  return (
    <section className="panel">
      <div className="tabla-clientes__encabezado">
        <div>
          <h3>Clientes</h3>
          <p>
            {clientesOrdenados.length} de {clientes.length} registros visibles
          </p>
        </div>

        <label className="tabla-clientes__buscador">
          <span>Buscar en la tabla</span>
          <input
            onChange={(evento) => setBusqueda(evento.target.value)}
            placeholder="Nombre, correo, telefono, canal, riesgo..."
            type="text"
            value={busqueda}
          />
        </label>
      </div>

      <div className="tabla-clientes">
        <table>
          <thead>
            <tr>
              <th>Contactar</th>
              {COLUMNAS_ORDENABLES.map((columna) => (
                <th key={columna.clave}>
                  <button
                    className={claseBotonOrden(columna.clave)}
                    onClick={() => cambiarOrden(columna.clave)}
                    type="button"
                  >
                    <span>{columna.etiqueta}</span>
                    <span className="tabla-clientes__orden-icono">
                      {obtenerIndicador(columna.clave)}
                    </span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {clientesOrdenados.length === 0 ? (
              <tr>
                <td className="tabla-clientes__vacio" colSpan={17}>
                  No hay clientes que coincidan con la busqueda actual.
                </td>
              </tr>
            ) : (
              clientesOrdenados.map((cliente) => {
                const enlaceWhatsApp = crearEnlaceWhatsApp(cliente.numeroTelefono);

                return (
                  <tr key={cliente.id}>
                    <td>
                      {enlaceWhatsApp || cliente.correoElectronico ? (
                        <div className="tabla-clientes__contactos">
                          {enlaceWhatsApp ? (
                            <a
                              className="tabla-clientes__contactar"
                              href={enlaceWhatsApp}
                              target="_blank"
                              rel="noreferrer"
                            >
                              WhatsApp
                            </a>
                          ) : null}

                          {cliente.correoElectronico ? (
                            <a
                              className="tabla-clientes__contactar tabla-clientes__contactar--correo"
                              href={`mailto:${cliente.correoElectronico}`}
                            >
                              Correo
                            </a>
                          ) : null}
                        </div>
                      ) : (
                        <span className="tabla-clientes__sin-contacto">Sin dato</span>
                      )}
                    </td>
                    <td>
                      <div className="tabla-clientes__principal">
                        <strong>{cliente.nombre}</strong>
                        <span>{cliente.correoElectronico}</span>
                      </div>
                    </td>
                    <td>{cliente.vendedorAsignado || "Sin dato"}</td>
                    <td>{formatearFecha(cliente.fechaReunion)}</td>
                    <td>{cliente.numeroTelefono || "Sin dato"}</td>
                    <td>
                      <EtiquetaEstado cliente={cliente} />
                    </td>
                    <td>{cliente.categoria?.industria || "Sin procesar"}</td>
                    <td>{obtenerTextoCategoria(cliente, "canalDescubrimiento")}</td>
                    <td>{obtenerTextoCategoria(cliente, "dolorPrincipal")}</td>
                    <td>{obtenerTextoCategoria(cliente, "necesidadClave")}</td>
                    <td>{obtenerTextoCategoria(cliente, "nivelUrgencia")}</td>
                    <td>{obtenerTextoCategoria(cliente, "nivelVolumen")}</td>
                    <td>{obtenerTextoCategoria(cliente, "requiereIntegracion")}</td>
                    <td>{obtenerTextoCategoria(cliente, "riesgoPrincipal")}</td>
                    <td>{obtenerTextoCategoria(cliente, "senalCompra")}</td>
                    <td>{obtenerTextoCategoria(cliente, "proximaAccion")}</td>
                    <td className="tabla-clientes__resumen">
                      {cliente.categoria?.resumen || "Todavia no se genero una categoria con IA."}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
