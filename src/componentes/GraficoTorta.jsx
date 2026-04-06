import { formatearPorcentaje } from "../utilidades";

const COLORES_TORTA = [
  "#1f7aff",
  "#5f7fff",
  "#8c7dff",
  "#c27cff",
  "#2fd39b",
  "#ff9d66",
  "#7dd3fc",
  "#f472b6"
];

function crearGradiente(datos, total) {
  let acumulado = 0;

  return datos
    .map((item, indice) => {
      const inicio = (acumulado / total) * 360;
      acumulado += item.valor;
      const fin = (acumulado / total) * 360;
      const color = COLORES_TORTA[indice % COLORES_TORTA.length];

      return `${color} ${inicio}deg ${fin}deg`;
    })
    .join(", ");
}

export default function GraficoTorta({ titulo, datos }) {
  const total = datos.reduce((suma, item) => suma + item.valor, 0);

  return (
    <section className="panel panel-grafico">
      <div className="panel__encabezado">
        <h3>{titulo}</h3>
      </div>

      {datos.length === 0 || total === 0 ? (
        <p className="panel__vacio">No hay datos para este grafico con los filtros actuales.</p>
      ) : (
        <div className="grafico-torta">
          <div className="grafico-torta__visual">
            <div
              className="grafico-torta__circulo"
              style={{
                background: `conic-gradient(${crearGradiente(datos, total)})`
              }}
            >
              <div className="grafico-torta__centro">
                <strong>{total}</strong>
                <span>clientes</span>
              </div>
            </div>
          </div>

          <div className="grafico-torta__leyenda">
            {datos.map((item, indice) => {
              const porcentaje = total ? (item.valor / total) * 100 : 0;
              const color = COLORES_TORTA[indice % COLORES_TORTA.length];

              return (
                <div className="grafico-torta__item" key={item.etiqueta}>
                  <span
                    className="grafico-torta__color"
                    style={{ backgroundColor: color }}
                    aria-hidden="true"
                  />

                  <div className="grafico-torta__texto">
                    <strong>{item.etiqueta}</strong>
                    <span>{item.detalle}</span>
                  </div>

                  <strong className="grafico-torta__porcentaje">
                    {formatearPorcentaje(porcentaje)}
                  </strong>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
