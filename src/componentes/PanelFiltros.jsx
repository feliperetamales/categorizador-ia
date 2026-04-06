export default function PanelFiltros({
  filtros,
  opcionesVendedor,
  opcionesDolor,
  opcionesCanal,
  opcionesUrgencia,
  alCambiarFiltro,
  alLimpiarFiltros,
  totalVisibles
}) {
  return (
    <section className="panel-filtros">
      <div className="panel-filtros__encabezado">
        <div>
          <h3>Filtros activos del panel</h3>
        </div>

        <span className="panel-filtros__contador">{totalVisibles} visibles</span>

        <button className="boton boton-secundario" onClick={alLimpiarFiltros} type="button">
          Limpiar
        </button>
      </div>

      <div className="panel-filtros__grilla">
        <label className="campo">
          <span>Buscar</span>
          <input
            type="text"
            value={filtros.texto}
            onChange={(evento) => alCambiarFiltro("texto", evento.target.value)}
            placeholder="Nombre, correo, industria..."
          />
        </label>

        <label className="campo">
          <span>Estado</span>
          <select
            value={filtros.estadoCierre}
            onChange={(evento) => alCambiarFiltro("estadoCierre", evento.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="cerrados">Cerrados</option>
            <option value="abiertos">Abiertos</option>
          </select>
        </label>

        <label className="campo">
          <span>Vendedor</span>
          <select
            value={filtros.vendedorAsignado}
            onChange={(evento) => alCambiarFiltro("vendedorAsignado", evento.target.value)}
          >
            <option value="">Todos</option>
            {opcionesVendedor.map((opcion) => (
              <option key={opcion.valor} value={opcion.valor}>
                {opcion.etiqueta}
              </option>
            ))}
          </select>
        </label>

        <label className="campo">
          <span>Dolor principal</span>
          <select
            value={filtros.dolorPrincipal}
            onChange={(evento) => alCambiarFiltro("dolorPrincipal", evento.target.value)}
          >
            <option value="">Todos</option>
            {opcionesDolor.map((opcion) => (
              <option key={opcion.valor} value={opcion.valor}>
                {opcion.etiqueta}
              </option>
            ))}
          </select>
        </label>

        <label className="campo">
          <span>Canal</span>
          <select
            value={filtros.canalDescubrimiento}
            onChange={(evento) => alCambiarFiltro("canalDescubrimiento", evento.target.value)}
          >
            <option value="">Todos</option>
            {opcionesCanal.map((opcion) => (
              <option key={opcion.valor} value={opcion.valor}>
                {opcion.etiqueta}
              </option>
            ))}
          </select>
        </label>

        <label className="campo">
          <span>Urgencia</span>
          <select
            value={filtros.nivelUrgencia}
            onChange={(evento) => alCambiarFiltro("nivelUrgencia", evento.target.value)}
          >
            <option value="">Todas</option>
            {opcionesUrgencia.map((opcion) => (
              <option key={opcion.valor} value={opcion.valor}>
                {opcion.etiqueta}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
