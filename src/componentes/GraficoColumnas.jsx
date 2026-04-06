export default function GraficoColumnas({ titulo, datos }) {
  const maximo = Math.max(...datos.map((item) => item.valor), 1);

  return (
    <section className="panel panel-grafico">
      <div className="panel__encabezado">
        <h3>{titulo}</h3>
      </div>

      {datos.length === 0 ? (
        <p className="panel__vacio">No hay datos para este grafico con los filtros actuales.</p>
      ) : (
        <div className="grafico-columnas__contenedor">
          <div className="grafico-columnas">
            {datos.map((item) => (
              <div className="grafico-columnas__item" key={item.etiqueta}>
                <strong className="grafico-columnas__valor">{item.valor}</strong>

                <div className="grafico-columnas__barra-fondo">
                  <div
                    className="grafico-columnas__barra"
                    style={{ height: `${(item.valor / maximo) * 100}%` }}
                  />
                </div>

                <strong className="grafico-columnas__etiqueta">{item.etiqueta}</strong>
                <span className="grafico-columnas__detalle">{item.detalle}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
