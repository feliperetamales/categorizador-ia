export default function TarjetaMetrica({ titulo, valor, detalle, textoBoton, alAbrirDetalle }) {
  return (
    <article className="tarjeta-metrica">
      <div className="tarjeta-metrica__encabezado">
        <p className="tarjeta-metrica__titulo">{titulo}</p>

        {alAbrirDetalle ? (
          <button className="tarjeta-metrica__boton" onClick={alAbrirDetalle} type="button">
            {textoBoton || "Ver detalle"}
          </button>
        ) : null}
      </div>

      <strong className="tarjeta-metrica__valor">{valor}</strong>
      <p className="tarjeta-metrica__detalle">{detalle}</p>
    </article>
  );
}
