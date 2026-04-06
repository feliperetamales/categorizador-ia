import { useEffect, useState } from "react";
import GraficoBarras from "./componentes/GraficoBarras";
import GraficoColumnas from "./componentes/GraficoColumnas";
import GraficoTorta from "./componentes/GraficoTorta";
import ModalDetalleClientes from "./componentes/ModalDetalleClientes";
import PanelFiltros from "./componentes/PanelFiltros";
import TablaClientes from "./componentes/TablaClientes";
import TarjetaMetrica from "./componentes/TarjetaMetrica";
import {
  calcularResumen,
  crearOportunidadesPrioritarias,
  crearOpciones,
  crearSerieDeCierre,
  crearSerieDeConteo,
  filtrarClientes,
  formatearFecha,
  formatearPorcentaje,
  obtenerEtiquetaCategoria
} from "./utilidades";

const FILTROS_INICIALES = {
  texto: "",
  estadoCierre: "todos",
  vendedorAsignado: "",
  dolorPrincipal: "",
  canalDescubrimiento: "",
  nivelUrgencia: ""
};

const MODELOS_IA = [
  { id: "gpt-5.4-mini", etiqueta: "GPT-5.4 mini" },
  { id: "gpt-5.4-nano", etiqueta: "GPT-5.4 nano" }
];

async function pedirJson(url, opciones = {}) {
  const respuesta = await fetch(url, {
    headers: {
      "Content-Type": "application/json"
    },
    ...opciones
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.detalle || datos.error || "Ocurrio un error inesperado.");
  }

  return datos;
}

function limpiarNumeroTelefono(numeroTelefono) {
  return String(numeroTelefono || "").replace(/\D/g, "");
}

function crearEnlaceWhatsApp(numeroTelefono) {
  const numeroLimpio = limpiarNumeroTelefono(numeroTelefono);

  if (!numeroLimpio) {
    return "";
  }

  return `https://wa.me/${numeroLimpio}`;
}

export default function App() {
  const [clientes, setClientes] = useState([]);
  const [estado, setEstado] = useState({
    totalClientes: 0,
    clientesConCategoria: 0,
    clientesSinCategoria: 0,
    ultimaActualizacion: null,
    tieneApiKey: false,
    modelo: "",
    modelosDisponibles: []
  });
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [detalleMetricaActiva, setDetalleMetricaActiva] = useState("");
  const [modeloSeleccionado, setModeloSeleccionado] = useState("gpt-5.4-nano");

  useEffect(() => {
    cargarDashboard();
  }, []);

  async function cargarDashboard() {
    try {
      setCargando(true);
      setError("");
      const datos = await pedirJson("/api/dashboard");
      setClientes(datos.clientes || []);
      setEstado(datos.estado || {});
      setModeloSeleccionado(datos.estado?.modelo || "gpt-5.4-nano");
    } catch (errorActual) {
      setError(errorActual.message);
    } finally {
      setCargando(false);
    }
  }

  async function procesarConIA(forzar = false) {
    try {
      setProcesando(true);
      setError("");

      const datos = await pedirJson("/api/procesar", {
        method: "POST",
        body: JSON.stringify({
          forzar,
          modelo: modeloSeleccionado
        })
      });

      setClientes(datos.clientes || []);
      setEstado(datos.estado || {});
      setModeloSeleccionado(datos.estado?.modelo || modeloSeleccionado);
    } catch (errorActual) {
      setError(errorActual.message);
    } finally {
      setProcesando(false);
    }
  }

  function cambiarFiltro(campo, valor) {
    setFiltros((previo) => ({
      ...previo,
      [campo]: valor
    }));
  }

  const clientesFiltrados = filtrarClientes(clientes, filtros);
  const resumen = calcularResumen(clientesFiltrados);
  const opcionesVendedor = crearOpciones(clientes, "vendedorAsignado");
  const opcionesDolor = crearOpciones(clientes, "dolorPrincipal");
  const opcionesCanal = crearOpciones(clientes, "canalDescubrimiento");
  const opcionesUrgencia = crearOpciones(clientes, "nivelUrgencia");
  const vendedores = crearSerieDeCierre(clientesFiltrados, "vendedorAsignado");
  const dolores = crearSerieDeConteo(clientesFiltrados, "dolorPrincipal");
  const canales = crearSerieDeConteo(clientesFiltrados, "canalDescubrimiento");
  const industrias = crearSerieDeConteo(clientesFiltrados, "industria");
  const oportunidades = crearOportunidadesPrioritarias(clientesFiltrados);
  const clientesUrgentes = clientesFiltrados.filter(
    (cliente) => cliente.categoria?.nivelUrgencia === "alta"
  );
  const clientesConIntegracion = clientesFiltrados.filter(
    (cliente) => cliente.categoria?.requiereIntegracion === "si"
  );
  const ultimaActualizacionTexto = estado.ultimaActualizacion
    ? new Date(estado.ultimaActualizacion).toLocaleString("es-CL", {
        dateStyle: "short",
        timeStyle: "short"
      })
    : "Sin cache";
  const configuracionesDetalle = {
    urgencia: {
      titulo: "Clientes con urgencia alta",
      descripcion: "Clientes que deberian priorizarse segun la categoria detectada.",
      clientes: clientesUrgentes
    },
    integracion: {
      titulo: "Clientes que piden integracion",
      descripcion: "Clientes que mencionan integraciones o dependencia con otros sistemas.",
      clientes: clientesConIntegracion
    }
  };
  const detalleActivo = detalleMetricaActiva
    ? configuracionesDetalle[detalleMetricaActiva]
    : null;
  const modelosDisponibles = estado.modelosDisponibles?.length
    ? estado.modelosDisponibles
    : MODELOS_IA;
  return (
    <main className="pagina">
      <nav className="navbar">
        <div className="navbar__marca">
          <p className="navbar__eyebrow">Prueba técnica Felipe Retamales - Vambe</p>
          <div className="navbar__titulo-fila">
            <strong className="navbar__titulo">Categorizador AI</strong>
            <span className="navbar__descripcion">Clientes categorizados con OpenAI</span>
          </div>
        </div>

        <div className="navbar__estado">
          <p className="navbar__ayuda-modelo">
            <strong>Nano:</strong> Más rapido. <strong>Mini:</strong> Tiene rate limit, por eso usa pausa entre solicitudes.
          </p>
          <article className="navbar__chip">
            <span>Reuniones categorizadas</span>
            <strong>
              {estado.clientesConCategoria || 0}/{estado.totalClientes || 0}
            </strong>
          </article>

          <article className="navbar__chip navbar__chip--selector">
            <span>Modelo</span>
            <select
              className="navbar__chip-select"
              value={modeloSeleccionado}
              onChange={(evento) => setModeloSeleccionado(evento.target.value)}
              disabled={procesando || cargando}
              aria-label="Seleccionar modelo de OpenAI"
            >
              {modelosDisponibles.map((modeloActual) => (
                <option key={modeloActual.id} value={modeloActual.id}>
                  {modeloActual.etiqueta}
                </option>
              ))}
            </select>
          </article>

          <article className="navbar__chip">
            <span>Última actualización</span>
            <strong>{ultimaActualizacionTexto}</strong>
          </article>

        </div>

        <div className="navbar__acciones">
          <button
            className="boton"
            onClick={() => procesarConIA(false)}
            disabled={procesando || cargando}
            type="button"
          >
            {procesando ? "Procesando..." : "Procesar restantes"}
          </button>

          <button
            className="boton boton-secundario"
            onClick={() => procesarConIA(true)}
            disabled={procesando || cargando}
            type="button"
          >
            Reprocesar todo
          </button>
        </div>
      </nav>

      {!cargando ? (
        <div className="barra-filtros">
          <PanelFiltros
            filtros={filtros}
            opcionesVendedor={opcionesVendedor}
            opcionesDolor={opcionesDolor}
            opcionesCanal={opcionesCanal}
            opcionesUrgencia={opcionesUrgencia}
            alCambiarFiltro={cambiarFiltro}
            alLimpiarFiltros={() => setFiltros(FILTROS_INICIALES)}
            totalVisibles={clientesFiltrados.length}
          />
        </div>
      ) : null}

      <div className="pagina__contenido">
        {!estado.tieneApiKey ? (
          <section className="aviso aviso--alerta">
            Falta `OPENAI_API_KEY` en tu archivo `.env`, asi que el panel puede leer el CSV pero no
            categorizarlo todavia.
          </section>
        ) : null}

        {estado.clientesConCategoria === 0 ? (
          <section className="aviso">
            Aun no hay categorias generadas. Presiona <strong>Procesar con OpenAI</strong> para crear
            las dimensiones del dashboard.
          </section>
        ) : null}

        {error ? <section className="aviso aviso--error">{error}</section> : null}

        {cargando ? (
          <section className="panel panel-cargando">Cargando informacion del panel...</section>
        ) : (
          <>
            <section className="rejilla-metricas">
              <TarjetaMetrica
                titulo="Clientes"
                valor={resumen.total}
                detalle="Registros luego de aplicar filtros"
              />
              <TarjetaMetrica
                titulo="Tasa de cierre"
                valor={formatearPorcentaje(resumen.tasaCierre)}
                detalle={`${resumen.cerrados} cierres sobre ${resumen.total || 0} clientes`}
              />
              <TarjetaMetrica
                titulo="Urgencia alta"
                valor={resumen.urgentes}
                detalle="Clientes que deberian priorizarse"
                textoBoton="Ver detalle"
                alAbrirDetalle={() => setDetalleMetricaActiva("urgencia")}
              />
              <TarjetaMetrica
                titulo="Piden integración"
                valor={resumen.conIntegracion}
                detalle="Clientes que mencionan integraciones"
                textoBoton="Ver detalle"
                alAbrirDetalle={() => setDetalleMetricaActiva("integracion")}
              />
            </section>

            <section className="rejilla-paneles">
              <GraficoBarras
                titulo="Tasa de cierre por vendedor"
                datos={vendedores}
                modo="porcentaje"
              />
              <GraficoTorta titulo="Dolores principales" datos={dolores} />
              <GraficoColumnas titulo="Canales de descubrimiento" datos={canales} />
              <GraficoBarras titulo="Industrias mas frecuentes" datos={industrias} />
            </section>

            <section className="panel">
              <div className="panel__encabezado">
                <h3>Oportunidades abiertas prioritarias</h3>
                <p>Clientes abiertos con mejor señal comercial según urgencia y señal de compra.</p>
              </div>

              {oportunidades.length === 0 ? (
                <p className="panel__vacio">No hay oportunidades abiertas con categoría para mostrar.</p>
              ) : (
                <div className="lista-oportunidades">
                  {oportunidades.map((cliente) => {
                    const enlaceWhatsApp = crearEnlaceWhatsApp(cliente.numeroTelefono);

                    return (
                      <article className="oportunidad" key={cliente.id}>
                        <div className="oportunidad__cabecera">
                          <div>
                            <strong>{cliente.nombre}</strong>
                            <span>
                              {cliente.vendedorAsignado} - {formatearFecha(cliente.fechaReunion)}
                            </span>
                          </div>

                          <div className="oportunidad__acciones">
                            {enlaceWhatsApp ? (
                              <a
                                className="oportunidad__whatsapp"
                                href={enlaceWhatsApp}
                                target="_blank"
                                rel="noreferrer"
                              >
                                WhatsApp
                              </a>
                            ) : null}

                            {cliente.correoElectronico ? (
                              <a
                                className="oportunidad__correo-boton"
                                href={`mailto:${cliente.correoElectronico}`}
                              >
                                Correo
                              </a>
                            ) : null}

                            <span className="etiqueta etiqueta--abierto">Abierto</span>
                          </div>
                        </div>

                        <p className="oportunidad__resumen">{cliente.categoria?.resumen}</p>

                        <div className="oportunidad__contacto">
                          <span>
                            Teléfono: +<strong>{cliente.numeroTelefono || "Sin dato"}</strong>
                          </span>
                          <span>
                            Correo:{" "}
                            {cliente.correoElectronico ? (
                              <a
                                className="oportunidad__enlace"
                                href={`mailto:${cliente.correoElectronico}`}
                              >
                                {cliente.correoElectronico}
                              </a>
                            ) : (
                              <strong>Sin dato</strong>
                            )}
                          </span>
                        </div>

                        <div className="oportunidad__datos">
                          <span>
                            Industria: <strong>{cliente.categoria?.industria || "Sin dato"}</strong>
                          </span>
                          <span>
                            Urgencia:{" "}
                            <strong>
                              {obtenerEtiquetaCategoria(
                                "nivelUrgencia",
                                cliente.categoria?.nivelUrgencia
                              )}
                            </strong>
                          </span>
                          <span>
                            Señal de compra:{" "}
                            <strong>
                              {obtenerEtiquetaCategoria(
                                "senalCompra",
                                cliente.categoria?.senalCompra
                              )}
                            </strong>
                          </span>
                          <span>
                            Siguiente paso:{" "}
                            <strong>
                              {obtenerEtiquetaCategoria(
                                "proximaAccion",
                                cliente.categoria?.proximaAccion
                              )}
                            </strong>
                          </span>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            <TablaClientes clientes={clientesFiltrados} />
          </>
        )}
      </div>

      <ModalDetalleClientes
        abierto={Boolean(detalleActivo)}
        titulo={detalleActivo?.titulo || ""}
        descripcion={detalleActivo?.descripcion || ""}
        clientes={detalleActivo?.clientes || []}
        alCerrar={() => setDetalleMetricaActiva("")}
        crearEnlaceWhatsApp={crearEnlaceWhatsApp}
      />
    </main>
  );
}
