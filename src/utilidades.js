const ETIQUETAS_CATEGORIAS = {
  canalDescubrimiento: {
    recomendacion: "Recomendacion",
    evento_o_conferencia: "Evento o conferencia",
    busqueda_web: "Busqueda web",
    contenido_o_redes: "Contenido o redes",
    otro: "Otro"
  },
  dolorPrincipal: {
    alto_volumen: "Alto volumen",
    respuestas_repetitivas: "Respuestas repetitivas",
    respuestas_complejas: "Respuestas complejas",
    falta_personalizacion: "Falta de personalizacion",
    seguimiento_manual: "Seguimiento manual",
    soporte_tecnico: "Soporte tecnico",
    disponibilidad_fuera_de_horario: "Fuera de horario",
    otro: "Otro"
  },
  necesidadClave: {
    automatizar_consultas: "Automatizar consultas",
    mejorar_tiempos: "Mejorar tiempos",
    integrar_sistemas: "Integrar sistemas",
    personalizar_respuestas: "Personalizar respuestas",
    escalar_operacion: "Escalar operacion",
    ordenar_informacion: "Ordenar informacion",
    otro: "Otro"
  },
  requiereIntegracion: {
    si: "Si",
    no: "No",
    no_mencionado: "No mencionado"
  },
  nivelUrgencia: {
    alta: "Alta",
    media: "Media",
    baja: "Baja"
  },
  nivelVolumen: {
    alto: "Alto",
    medio: "Medio",
    bajo: "Bajo",
    no_mencionado: "No mencionado"
  },
  riesgoPrincipal: {
    ninguno: "Ninguno",
    privacidad: "Privacidad",
    precision: "Precision",
    costo: "Costo",
    implementacion: "Implementacion",
    adopcion_interna: "Adopcion interna",
    otro: "Otro"
  },
  senalCompra: {
    alta: "Alta",
    media: "Media",
    baja: "Baja"
  },
  proximaAccion: {
    agendar_demo: "Agendar demo",
    enviar_caso_de_uso: "Enviar caso de uso",
    revisar_integracion: "Revisar integracion",
    resolver_objeciones: "Resolver objeciones",
    seguimiento_general: "Seguimiento general"
  }
};

function capitalizarTexto(texto) {
  if (!texto) {
    return "Sin dato";
  }

  const limpio = String(texto).replace(/_/g, " ");
  return limpio.charAt(0).toUpperCase() + limpio.slice(1);
}

export function obtenerEtiquetaCategoria(campo, valor) {
  if (!valor) {
    return "Sin dato";
  }

  return ETIQUETAS_CATEGORIAS[campo]?.[valor] || capitalizarTexto(valor);
}

export function obtenerValorCliente(cliente, campo) {
  if (campo in cliente) {
    return cliente[campo];
  }

  return cliente.categoria?.[campo] || "";
}

export function formatearFecha(fecha) {
  if (!fecha) {
    return "Sin fecha";
  }

  const fechaObjeto = new Date(`${fecha}T00:00:00`);

  if (Number.isNaN(fechaObjeto.getTime())) {
    return fecha;
  }

  return fechaObjeto.toLocaleDateString("es-CL");
}

export function formatearPorcentaje(valor) {
  return `${Math.round(valor)}%`;
}

export function crearOpciones(clientes, campo) {
  const valores = new Set();

  clientes.forEach((cliente) => {
    const valor = obtenerValorCliente(cliente, campo);

    if (valor) {
      valores.add(valor);
    }
  });

  return Array.from(valores)
    .sort((a, b) =>
      obtenerEtiquetaCategoria(campo, a).localeCompare(obtenerEtiquetaCategoria(campo, b), "es")
    )
    .map((valor) => ({
      valor,
      etiqueta: obtenerEtiquetaCategoria(campo, valor)
    }));
}

export function filtrarClientes(clientes, filtros) {
  const texto = filtros.texto.trim().toLowerCase();

  return clientes.filter((cliente) => {
    if (texto) {
      const camposBusqueda = [
        cliente.nombre,
        cliente.correoElectronico,
        cliente.vendedorAsignado,
        cliente.categoria?.industria,
        cliente.categoria?.resumen
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (!camposBusqueda.includes(texto)) {
        return false;
      }
    }

    if (filtros.estadoCierre === "cerrados" && !cliente.cerrado) {
      return false;
    }

    if (filtros.estadoCierre === "abiertos" && cliente.cerrado) {
      return false;
    }

    if (filtros.vendedorAsignado && cliente.vendedorAsignado !== filtros.vendedorAsignado) {
      return false;
    }

    if (filtros.dolorPrincipal && cliente.categoria?.dolorPrincipal !== filtros.dolorPrincipal) {
      return false;
    }

    if (
      filtros.canalDescubrimiento &&
      cliente.categoria?.canalDescubrimiento !== filtros.canalDescubrimiento
    ) {
      return false;
    }

    if (filtros.nivelUrgencia && cliente.categoria?.nivelUrgencia !== filtros.nivelUrgencia) {
      return false;
    }

    return true;
  });
}

function agruparClientes(clientes, campo) {
  const grupos = {};

  clientes.forEach((cliente) => {
    const valorOriginal = obtenerValorCliente(cliente, campo);
    const clave = valorOriginal || "sin_dato";

    if (!grupos[clave]) {
      grupos[clave] = {
        clave,
        etiqueta: campo === "industria" ? capitalizarTexto(clave) : obtenerEtiquetaCategoria(campo, clave),
        total: 0,
        cerrados: 0
      };
    }

    grupos[clave].total += 1;

    if (cliente.cerrado) {
      grupos[clave].cerrados += 1;
    }
  });

  return Object.values(grupos);
}

export function crearSerieDeConteo(clientes, campo, limite = Number.POSITIVE_INFINITY) {
  const gruposOrdenados = agruparClientes(clientes, campo).sort((a, b) => b.total - a.total);
  const gruposVisibles = Number.isFinite(limite) ? gruposOrdenados.slice(0, limite) : gruposOrdenados;

  return gruposVisibles.map((grupo) => ({
    etiqueta: grupo.etiqueta,
    valor: grupo.total,
    detalle: `${grupo.total} clientes`
  }));
}

export function crearSerieDeCierre(clientes, campo, limite = Number.POSITIVE_INFINITY) {
  const gruposOrdenados = agruparClientes(clientes, campo)
    .filter((grupo) => grupo.total > 0)
    .sort((a, b) => b.total - a.total);
  const gruposVisibles = Number.isFinite(limite) ? gruposOrdenados.slice(0, limite) : gruposOrdenados;

  return gruposVisibles.map((grupo) => ({
    etiqueta: grupo.etiqueta,
    valor: (grupo.cerrados / grupo.total) * 100,
    detalle: `${grupo.cerrados}/${grupo.total} cerrados`
  }));
}

export function calcularResumen(clientes) {
  const total = clientes.length;
  const cerrados = clientes.filter((cliente) => cliente.cerrado).length;
  const abiertos = total - cerrados;
  const urgentes = clientes.filter((cliente) => cliente.categoria?.nivelUrgencia === "alta").length;
  const conIntegracion = clientes.filter(
    (cliente) => cliente.categoria?.requiereIntegracion === "si"
  ).length;

  return {
    total,
    cerrados,
    abiertos,
    urgentes,
    conIntegracion,
    tasaCierre: total ? (cerrados / total) * 100 : 0
  };
}

function puntajePrioridad(cliente) {
  const puntajesSenal = { alta: 30, media: 20, baja: 10 };
  const puntajesUrgencia = { alta: 9, media: 6, baja: 3 };
  const puntajeIntegracion = cliente.categoria?.requiereIntegracion === "si" ? 2 : 0;

  return (
    (puntajesSenal[cliente.categoria?.senalCompra] || 0) +
    (puntajesUrgencia[cliente.categoria?.nivelUrgencia] || 0) +
    puntajeIntegracion
  );
}

export function crearOportunidadesPrioritarias(clientes, limite = 5) {
  return clientes
    .filter((cliente) => !cliente.cerrado && cliente.categoria)
    .sort((a, b) => puntajePrioridad(b) - puntajePrioridad(a))
    .slice(0, limite);
}
