import OpenAI from "openai";

const ESQUEMA_CATEGORIAS = {
  type: "object",
  additionalProperties: false,
  properties: {
    industria: {
      type: "string",
      description: "Industria principal del cliente. Maximo 3 palabras."
    },
    canalDescubrimiento: {
      type: "string",
      enum: [
        "recomendacion",
        "evento_o_conferencia",
        "busqueda_web",
        "contenido_o_redes",
        "otro"
      ]
    },
    dolorPrincipal: {
      type: "string",
      enum: [
        "alto_volumen",
        "respuestas_repetitivas",
        "respuestas_complejas",
        "falta_personalizacion",
        "seguimiento_manual",
        "soporte_tecnico",
        "disponibilidad_fuera_de_horario",
        "otro"
      ]
    },
    necesidadClave: {
      type: "string",
      enum: [
        "automatizar_consultas",
        "mejorar_tiempos",
        "integrar_sistemas",
        "personalizar_respuestas",
        "escalar_operacion",
        "ordenar_informacion",
        "otro"
      ]
    },
    requiereIntegracion: {
      type: "string",
      enum: ["si", "no", "no_mencionado"]
    },
    nivelUrgencia: {
      type: "string",
      enum: ["alta", "media", "baja"]
    },
    nivelVolumen: {
      type: "string",
      enum: ["alto", "medio", "bajo", "no_mencionado"]
    },
    riesgoPrincipal: {
      type: "string",
      enum: [
        "ninguno",
        "privacidad",
        "precision",
        "costo",
        "implementacion",
        "adopcion_interna",
        "otro"
      ]
    },
    senalCompra: {
      type: "string",
      enum: ["alta", "media", "baja"]
    },
    proximaAccion: {
      type: "string",
      enum: [
        "agendar_demo",
        "enviar_caso_de_uso",
        "revisar_integracion",
        "resolver_objeciones",
        "seguimiento_general"
      ]
    },
    resumen: {
      type: "string",
      description: "Resumen breve de la oportunidad en una sola frase. Maximo 160 caracteres."
    }
  },
  required: [
    "industria",
    "canalDescubrimiento",
    "dolorPrincipal",
    "necesidadClave",
    "requiereIntegracion",
    "nivelUrgencia",
    "nivelVolumen",
    "riesgoPrincipal",
    "senalCompra",
    "proximaAccion",
    "resumen"
  ]
};

function obtenerTextoSalida(respuesta) {
  if (typeof respuesta.output_text === "string" && respuesta.output_text.trim()) {
    return respuesta.output_text;
  }

  const mensaje = respuesta.output?.find((item) => item.type === "message");
  const texto = mensaje?.content?.find(
    (item) => item.type === "output_text" || item.type === "text"
  );

  return texto?.text || "";
}

export function crearClienteOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return null;
  }

  return new OpenAI({ apiKey });
}

export async function categorizarClienteConIA(cliente, clienteOpenAI, modelo) {
  const instrucciones = [
    "Eres un analista comercial de Vambe.",
    "Debes leer la transcripcion y devolver solo JSON valido.",
    "Clasifica la oportunidad pensando en ventas B2B y atencion automatizada.",
    "No inventes datos que no esten en la transcripcion.",
    "Si algo no aparece con claridad, usa la opcion mas prudente."
  ].join(" ");

  const entrada = [
    `Cliente: ${cliente.nombre}`,
    `Vendedor asignado: ${cliente.vendedorAsignado}`,
    "Transcripcion:",
    cliente.transcripcion
  ].join("\n");

  const respuesta = await clienteOpenAI.responses.create({
    model: modelo,
    instructions: instrucciones,
    input: entrada,
    max_output_tokens: 500,
    text: {
      format: {
        type: "json_schema",
        name: "categoria_cliente_vambe",
        strict: true,
        schema: ESQUEMA_CATEGORIAS
      }
    }
  });

  const texto = obtenerTextoSalida(respuesta);

  if (!texto) {
    throw new Error("La respuesta de OpenAI llego vacia.");
  }

  return JSON.parse(texto);
}
