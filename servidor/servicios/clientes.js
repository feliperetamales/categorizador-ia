import {
  calcularHuellaTexto,
  cargarCacheCategorias,
  crearClaveCliente,
  guardarCacheCategorias
} from "./cache.js";
import { leerClientesDesdeCsv } from "./csv.js";
import { categorizarClienteConIA, crearClienteOpenAI } from "./openai.js";

const MODELOS_DISPONIBLES = {
  "gpt-5.4-mini": {
    id: "gpt-5.4-mini",
    etiqueta: "GPT-5.4 mini",
    esperaEntreSolicitudesMs: 5000
  },
  "gpt-5.4-nano": {
    id: "gpt-5.4-nano",
    etiqueta: "GPT-5.4 nano",
    esperaEntreSolicitudesMs: 0
  }
};

const MODELO_POR_DEFECTO = "gpt-5.4-nano";
const ESPERA_REINTENTO_MINIMA_MS = 2000;
const MAXIMO_REINTENTOS = 5;

let modeloActivo = MODELO_POR_DEFECTO;

function obtenerConfiguracionModelo(modeloSolicitado = modeloActivo) {
  if (MODELOS_DISPONIBLES[modeloSolicitado]) {
    return MODELOS_DISPONIBLES[modeloSolicitado];
  }

  return MODELOS_DISPONIBLES[MODELO_POR_DEFECTO];
}

function crearEstadoDashboard(clientesUnidos, cache) {
  const clientesConCategoria = clientesUnidos.filter((cliente) => cliente.categoria).length;
  const ultimaActualizacion = Object.values(cache)
    .map((item) => item.actualizadoEn)
    .filter(Boolean)
    .sort()
    .at(-1) || null;

  return {
    totalClientes: clientesUnidos.length,
    clientesConCategoria,
    clientesSinCategoria: clientesUnidos.length - clientesConCategoria,
    ultimaActualizacion,
    tieneApiKey: Boolean(process.env.OPENAI_API_KEY),
    modelo: modeloActivo,
    modelosDisponibles: Object.values(MODELOS_DISPONIBLES).map(({ id, etiqueta }) => ({
      id,
      etiqueta
    }))
  };
}

function unirClientesConCategorias(clientes, cache) {
  const clientesUnidos = clientes.map((cliente) => {
    const clave = crearClaveCliente(cliente);
    const registro = cache[clave];
    const huellaActual = calcularHuellaTexto(cliente.transcripcion);
    const categoria = registro?.huella === huellaActual ? registro.categoria : null;

    return {
      ...cliente,
      categoria
    };
  });

  return {
    clientes: clientesUnidos,
    estado: crearEstadoDashboard(clientesUnidos, cache)
  };
}

function esperar(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function esErrorRateLimit(error) {
  const mensaje = String(error?.message || "").toLowerCase();
  return mensaje.includes("rate limit") || mensaje.includes("429");
}

function obtenerEsperaDesdeError(error) {
  const mensaje = String(error?.message || "");
  const coincidencia = mensaje.match(/try again in (\d+)s/i);

  if (!coincidencia) {
    return null;
  }

  return (Number(coincidencia[1]) + 1) * 1000;
}

function obtenerEsperaReintento(error, esperaBaseMs, intento) {
  const esperaDesdeError = obtenerEsperaDesdeError(error);

  if (esperaDesdeError) {
    return esperaDesdeError;
  }

  const esperaBaseSegura = Math.max(esperaBaseMs, ESPERA_REINTENTO_MINIMA_MS);
  return Math.min(60000, esperaBaseSegura * (intento + 1));
}

async function categorizarConReintento(cliente, clienteOpenAI, modelo, esperaBaseMs) {
  for (let intento = 0; intento < MAXIMO_REINTENTOS; intento += 1) {
    try {
      return await categorizarClienteConIA(cliente, clienteOpenAI, modelo);
    } catch (error) {
      const esRateLimit = esErrorRateLimit(error);
      const esUltimoIntento = intento === MAXIMO_REINTENTOS - 1;

      if (!esRateLimit || esUltimoIntento) {
        throw error;
      }

      const esperaReintento = obtenerEsperaReintento(error, esperaBaseMs, intento);

      console.warn(
        `[IA] Rate limit detectado para ${cliente.nombre}. Reintentando en ${Math.ceil(
          esperaReintento / 1000
        )}s.`
      );

      await esperar(esperaReintento);
    }
  }

  throw new Error("No se pudo categorizar el cliente despues de varios reintentos.");
}

export async function obtenerDashboard() {
  const clientes = leerClientesDesdeCsv();
  const cache = cargarCacheCategorias();

  return unirClientesConCategorias(clientes, cache);
}

export async function procesarClientesConIA({ forzar = false, modelo } = {}) {
  const clienteOpenAI = crearClienteOpenAI();

  if (!clienteOpenAI) {
    throw new Error("Falta la variable OPENAI_API_KEY en el archivo .env.");
  }

  const configuracionModelo = obtenerConfiguracionModelo(modelo);
  const esperaEntreSolicitudesMs = configuracionModelo.esperaEntreSolicitudesMs;
  const clientes = leerClientesDesdeCsv();
  const cache = cargarCacheCategorias();
  let procesadosEnEstaEjecucion = 0;
  let yaSeHizoUnaSolicitud = false;

  modeloActivo = configuracionModelo.id;

  for (let indice = 0; indice < clientes.length; indice += 1) {
    const cliente = clientes[indice];
    const clave = crearClaveCliente(cliente);
    const huella = calcularHuellaTexto(cliente.transcripcion);
    const registro = cache[clave];
    const tieneCacheValido = !forzar && registro?.huella === huella && registro?.categoria;

    if (tieneCacheValido) {
      continue;
    }

    if (yaSeHizoUnaSolicitud && esperaEntreSolicitudesMs > 0) {
      console.log(
        `[IA] Esperando ${Math.ceil(esperaEntreSolicitudesMs / 1000)}s antes de la siguiente solicitud...`
      );
      await esperar(esperaEntreSolicitudesMs);
    }

    console.log(
      `[IA] Procesando ${indice + 1}/${clientes.length}: ${cliente.nombre} con ${configuracionModelo.id}`
    );

    const categoria = await categorizarConReintento(
      cliente,
      clienteOpenAI,
      configuracionModelo.id,
      esperaEntreSolicitudesMs
    );

    cache[clave] = {
      huella,
      actualizadoEn: new Date().toISOString(),
      categoria
    };

    procesadosEnEstaEjecucion += 1;
    yaSeHizoUnaSolicitud = true;
  }

  guardarCacheCategorias(cache);

  return {
    ...(await obtenerDashboard()),
    procesadosEnEstaEjecucion
  };
}
