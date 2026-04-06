import { formatearPorcentaje } from "../utilidades";

export default function GraficoBarras({ titulo, datos, modo = "conteo" }) {
  const maximo = Math.max(...datos.map((item) => item.valor), 1);

  return (
    <section className="panel panel-grafico">
      <div className="panel__encabezado">
        <h3>{titulo}</h3>
      </div>

      {datos.length === 0 ? (
        <p className="panel__vacio">No hay datos para este grafico con los filtros actuales.</p>
      ) : (
        <div className="grafico-barras__contenedor">
          <div className="grafico-barras">
            {datos.map((item) => (
              <div className="grafico-barras__fila" key={item.etiqueta}>
                <div className="grafico-barras__texto">
                  <span>{item.etiqueta}</span>
                  <span className="grafico-barras__detalle">{item.detalle}</span>
                </div>

                <div className="grafico-barras__barra-fondo">
                  <div
                    className="grafico-barras__barra"
                    style={{ width: `${(item.valor / maximo) * 100}%` }}
                  />
                </div>

                <strong className="grafico-barras__valor">
                  {modo === "porcentaje" ? formatearPorcentaje(item.valor) : item.valor}
                </strong>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
