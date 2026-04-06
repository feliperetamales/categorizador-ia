import { formatearFecha, obtenerEtiquetaCategoria } from "../utilidades";

export default function ModalDetalleClientes({
  abierto,
  titulo,
  descripcion,
  clientes,
  alCerrar,
  crearEnlaceWhatsApp
}) {
  if (!abierto) {
    return null;
  }

  return (
    <div className="modal-capa" onClick={(evento) => evento.target === evento.currentTarget && alCerrar()}>
      <section className="modal-panel" role="dialog" aria-modal="true" aria-label={titulo}>
        <div className="modal-panel__encabezado">
          <div>
            <p className="modal-panel__eyebrow">Detalle de clientes</p>
            <h3>{titulo}</h3>
            <p>{descripcion}</p>
          </div>

          <button className="boton boton-secundario modal-panel__cerrar" onClick={alCerrar} type="button">
            Cerrar
          </button>
        </div>

        {clientes.length === 0 ? (
          <p className="panel__vacio">No hay clientes para mostrar con los filtros actuales.</p>
        ) : (
          <div className="modal-clientes">
            {clientes.map((cliente) => {
              const enlaceWhatsApp = crearEnlaceWhatsApp(cliente.numeroTelefono);

              return (
                <article className="modal-cliente" key={cliente.id}>
                  <div className="modal-cliente__cabecera">
                    <div>
                      <strong>{cliente.nombre}</strong>
                      <span>
                        {cliente.vendedorAsignado} - {formatearFecha(cliente.fechaReunion)}
                      </span>
                    </div>

                    <span className={`etiqueta ${cliente.cerrado ? "etiqueta--cerrado" : "etiqueta--abierto"}`}>
                      {cliente.cerrado ? "Cerrado" : "Abierto"}
                    </span>
                  </div>

                  <p className="modal-cliente__resumen">
                    {cliente.categoria?.resumen || "Todavia no se genero una categoria con IA."}
                  </p>

                  <div className="modal-cliente__datos">
                    <span>
                      Correo: <strong>{cliente.correoElectronico || "Sin dato"}</strong>
                    </span>
                    <span>
                      Telefono: <strong>{cliente.numeroTelefono || "Sin dato"}</strong>
                    </span>
                    <span>
                      Industria: <strong>{cliente.categoria?.industria || "Sin dato"}</strong>
                    </span>
                    <span>
                      Urgencia:{" "}
                      <strong>
                        {obtenerEtiquetaCategoria("nivelUrgencia", cliente.categoria?.nivelUrgencia)}
                      </strong>
                    </span>
                    <span>
                      Integracion:{" "}
                      <strong>
                        {obtenerEtiquetaCategoria(
                          "requiereIntegracion",
                          cliente.categoria?.requiereIntegracion
                        )}
                      </strong>
                    </span>
                  </div>

                  <div className="modal-cliente__acciones">
                    {cliente.correoElectronico ? (
                      <a className="modal-cliente__accion" href={`mailto:${cliente.correoElectronico}`}>
                        Enviar correo
                      </a>
                    ) : null}

                    {enlaceWhatsApp ? (
                      <a
                        className="modal-cliente__accion modal-cliente__accion--whatsapp"
                        href={enlaceWhatsApp}
                        target="_blank"
                        rel="noreferrer"
                      >
                        WhatsApp
                      </a>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
