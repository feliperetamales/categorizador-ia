# Categorizador AI

## Arquitectura
Frontend: `React + Vite` 
Backend: `Node.js + Express`
IA de asistencia: Codex con modelo GPT-5.4.
Deploy: Render

## Flujo general
La idea es:

- Leer el archivo `vambe_clients.csv`
- Enviar cada transcripcion a OpenAI
- Guardar una categoria estructurada en cache local
- Mostrar metricas, filtros y oportunidades en un dashboard facil de entender
- Contactar fácilmente a los clientes

### Categorias que genera la IA

Cada transcripcion se categoriza:

- `industria`
- `canalDescubrimiento`
- `dolorPrincipal`
- `necesidadClave`
- `requiereIntegracion`
- `nivelUrgencia`
- `nivelVolumen`
- `riesgoPrincipal`
- `senalCompra`
- `proximaAccion`
- `resumen`

Elegi estas dimensiones porque ayudan al equipo comercial a responder preguntas concretas:

- Qué industrias convierten mejor
- Qué dolores aparecen mas seguido
- Qué vendedores cierran mejor
- Qué clientes abiertos deberian priorizarse
- Cuántos clientes piden integraciones

Se basa todo con este esquema JSON que se le pasa a OpenAI para que genere la categoria de cada cliente:
```js
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
```

### Estructura

- `servidor/`: Básicamente todo el backend: lectura del CSV, integracion con la API de OpenAI y endpoints
- `src/`: Básicamente todo el frontend: componentes, estilos y lógica de visualización
- `datos/cache-categorias.json`: cache local de categorias generadas (evita reprocesar todo el CSV cada vez)



## Ejecutar localmente

0. Configurar variables de entorno

Crea un archivo `.env` basado en `.env.example`.

Ejemplo:
```env
PORT=3000
PUERTO_API=3001
OPENAI_API_KEY=tu_clave
```
Estas son las variables para conectar con la API de OpenAI y configurar los puertos del frontend y backend.

Regla actual del procesamiento:
- `GPT-5.4 mini`: usa pausa entre solicitudes para evitar rate limit.
- `GPT-5.4 nano`: procesa sin pausa entre solicitudes.

En el navbar del panel aparece una ayuda corta para recordarlo:
- `Nano`: mas rapido.
- `Mini`: mas estable para extraer, pero puede pegar rate limit y por eso usa pausa.

1. Instala dependencias:

```bash
npm install
```

2. Levanta frontend y backend en desarrollo:

```bash
npm run dev
```

3. Abre:

```text
http://localhost:3000

```

### Scripts

- `npm run dev`: frontend + backend
- `npm run build`: compila el frontend
- `npm start`: levanta el backend y sirve `dist/`

## Decisiones claves

### Categorias y dashboard
- Se eligen categorias que sirven para priorizar clientes y entender patrones de compra
- Se muestra un dashboard simple para que sea fácil de utilizar

### Arquitectura y tecnologías

- Use React y express debido a que los uso en mi día a día
- Use OpenAI a pesar de no tener una opción gratis porque es lo que conocía y fue más simple de integrar
- Se deployó estáticamente para simplificar ya que es gratis
- Se usó cache local en lugar de una DB real para evitar complejidad de infraestructura


## PD:
Se utiliza un temporizador de 22 segundos entre solicitudes con el modelo mini a OpenAI para evitar problemas de rate limit, por lo cual el procesamiento completo puede ser un poco lento, al ser 60 clientes el total es 22 minutos aprox
