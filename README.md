# MS3 — Infraestructura / Incidencias API

Microservicio de **infraestructura aeroportuaria e incidencias** del proyecto parcial **CS2032 — Cloud Computing (Ciclo 2026-2)**, dominio **Aeropuerto Internacional Jorge Chávez**.

Implementado en **Node.js + Express + MongoDB 7** (`Node 20`). Gestiona los **recursos** de infraestructura (mangas y radares), las **incidencias** operativas y las **asignaciones** (relación *Utiliza* vuelo ↔ recurso).

> **Responsable:** Edinson (MS3) · **Requiere MS2** (`ms2-vuelos-api`) para validar `vuelo_id`.

---

## Tabla de contenidos

1. [Contexto del proyecto](#contexto-del-proyecto)
2. [Stack tecnológico](#stack-tecnológico)
3. [Modelo de datos (MongoDB)](#modelo-de-datos-mongodb)
4. [Endpoints de la API](#endpoints-de-la-api)
5. [Enums y contratos compartidos](#enums-y-contratos-compartidos)
6. [Reglas de negocio](#reglas-de-negocio)
7. [Puesta en marcha](#puesta-en-marcha)
8. [Ejemplos de uso](#ejemplos-de-uso)
9. [Despliegue](#despliegue)
10. [Documentación relacionada](#documentación-relacionada)
11. [Licencia](#licencia)

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Runtime | Node.js `20` (imagen base `node:20-alpine`) |
| Framework | Express `4.x` |
| ODM / BD | Mongoose `8.x` → MongoDB `7` (`mongo:7`) |
| Validación | AJV `8` + `ajv-formats` (JSON Schema) |
| Contenedores | Docker + `docker compose` |
| Configuración | Variables de entorno (`dotenv`) |

---

## Modelo de datos (MongoDB)

Base de datos: **`infra_db`**. Tres colecciones: `recursos`, `incidencias`, `asignaciones`. Sin relaciones físicas; los `recurso_id` referencian `recursos.id` (numérico propio) y los `vuelo_id` son referencias suaves a MS2.

### `recursos`

Documento polimórfico: `tipo` discrimina el submódulo `manga` o `radar`.

```json
{
  "id": 42,
  "nombre_tecnico_locacion": "Espigón A - Puente A07",
  "tipo": "manga",
  "manga": { "estado_acople": "Libre", "longitud": 24.5, "clase_max": "E" }
}
```

```json
{
  "id": 187,
  "nombre_tecnico_locacion": "TORRE - Radar Primario",
  "tipo": "radar",
  "radar": { "estado_radar": "Operativo", "frecuencia": "Banda S" }
}
```

### `incidencias`

Documento con arrays `afecta_recursos[]` y `retrasa_vuelos[]` (cada elemento es `{ recurso_id | vuelo_id }`).

```json
{
  "id": 10231,
  "gravedad": "Alta",
  "descripcion": "Falla intermitente del radar primario en banda S",
  "tipo_incidencia": "Falla_Radar",
  "fecha_reporte": "2026-09-01T14:22:00Z",
  "fecha_cierre": null,
  "afecta_recursos": [ { "recurso_id": 7 } ],
  "retrasa_vuelos": [ { "vuelo_id": 1841 }, { "vuelo_id": 1843 } ]
}
```

### `asignaciones`

Representa la relación **Utiliza** (vuelo ↔ recurso). `vuelo_id_externo` es el id proveniente de MS2.

```json
{
  "recurso_id": 12,
  "vuelo_id_externo": 1841,
  "fecha_inicio": "2026-09-02T08:30:00Z",
  "fecha_fin": "2026-09-02T10:15:00Z",
  "estado_asignacion": "En_Curso"
}
```

---

## Endpoints de la API

Base: **`/api/infra`**. Todos responden JSON.

### Health
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/infra/health` | Estado del servicio y de la conexión a MongoDB (`UP` / `DOWN`) |

> También se sirve en `/health` y `/api/infra` para compatibilidad con el balanceador.

### Recursos (`/api/infra/recursos`)
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/infra/recursos` | Lista recursos. Filtros opcionales por query: `tipo`, `estado` (`?tipo=manga`) |
| `GET` | `/api/infra/recursos/:id` | Recurso por `_id` (ObjectId) — `404` si no existe |
| `POST` | `/api/infra/recursos` | Crea recurso (`manga` \| `radar`) — `201`; `400` si falla validación |
| `PATCH` | `/api/infra/recursos/:id/estado` | Actualiza estado del recurso |

### Incidencias (`/api/infra/incidencias`)
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/infra/incidencias` | Lista incidencias. Filtros: `tipo` (enum), `desde` / `hasta` (ISO 8601 sobre `fecha_reporte`) |
| `GET` | `/api/infra/incidencias/:id` | Incidencia por `_id` — `404` si no existe |
| `POST` | `/api/infra/incidencias` | Crea incidencia — `201`; `400` si falla validación. *(Pendiente: validación de `retrasa_vuelos[]` contra MS2)* |
| `PATCH` | `/api/infra/incidencias/:id/cierre` | Cierra la incidencia (setea `fecha_cierre`) |

### Asignaciones (`/api/infra/asignaciones`)
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/infra/asignaciones` | Lista asignaciones. Filtros opcionales por query |
| `POST` | `/api/infra/asignaciones` | Crea asignación. Valida que `recurso_id` exista — `404` si no; *(pendiente: validación de `vuelo_id_externo` contra MS2)* |

Códigos de error: `400` validación (AJV) · `404` recurso no encontrado · `500` error interno.

---

## Enums y contratos compartidos

Valores **idénticos** (mismo string, sin tildes) en los 3 microservicios con BD para que funcionen los `JOIN` de Athena. Fuente oficial: `docs/contratos/enums.md`.

| Enum | Valores |
|---|---|
| `tipo_recurso` | `manga` · `radar` |
| `estado_acople` | `Libre` · `Ocupado` · `Mantenimiento` |
| `gravedad` | `Leve` · `Moderada` · `Alta` · `Critica` |
| `tipo_incidencia` | `Falla_Radar` · `Inundacion` · `Falta_Combustible` · `Saturacion_Vial` · `Manga_Inoperativa` · `Otro` |
| `frecuencia_radar` | `Banda L` · `Banda S` · `Banda C` · `Banda X` |
| `clase_aeronave` (OACI) | `A` · `B` · `C` · `D` · `E` · `F` |

- **Fechas:** ISO 8601 UTC (`2026-09-02T14:22:00Z`).
- **Sin tildes** en los valores de enum (ej. `Critica`, `Transito`) para evitar problemas de encoding CSV → Glue → Athena.

---

## Reglas de negocio

1. **Un recurso debe ser `manga` o `radar`**, y solo el submódulo correspondiente se valida.
2. **Clase de aeronave vs. manga:** una aeronave de clase mayor no puede acoplarse a una manga de clase menor (orden `A < B < C < D < E < F`) — validado en la capa de aplicación.
3. **Referencia suave a MS2:** al crear incidencias o asignaciones que referencien vuelos, el `vuelo_id` debe existir en MS2 (validación REST) — *pendiente de implementar*.
4. **`id` numérico propio en `recursos` e `incidencias`** (único en su colección) para preservar identidad estable entre el microservicio y la ingesta al data lake.

---

## Puesta en marcha

### Requisitos previos
- Docker + Docker Compose
- (Opcional) Node.js 20 para desarrollo local

### 1. Configurar entorno

Copiar `.env.example` a `.env`:

```
PORT=3003
MONGO_URI=mongodb://localhost:27017/infra_db
MS2_URL=http://localhost:8082
```

### 2. Levantar con Docker Compose

```
docker compose up --build
```

Levanta la API en `http://localhost:3003` y MongoDB 7 (volumen persistente `mongo_data`). Con `nodemon --legacy-watch` el contenedor se reinicia automáticamente ante cambios en el código.

### 3. Verificar

```
curl http://localhost:3003/api/infra/health
```

Respuesta esperada:

```json
{
  "status": "UP",
  "service": "ms3-infraestructura-api",
  "database": "connected",
  "timestamp": "..."
}
```

### 4. En desarrollo (sin Docker)

```
npm install
npm run dev   # nodemon
```

---

## Ejemplos de uso

**Crear una manga:**
```bash
curl -X POST http://localhost:3003/api/infra/recursos \
  -H "Content-Type: application/json" \
  -d '{"id": 1, "nombre_tecnico_locacion": "Espigón A - Puente A07", "tipo": "manga", "manga": {"estado_acople": "Libre", "longitud": 24.5, "clase_max": "E"}}'
```

**Registrar una incidencia:**
```bash
curl -X POST http://localhost:3003/api/infra/incidencias \
  -H "Content-Type: application/json" \
  -d '{"id": 1, "gravedad": "Alta", "descripcion": "Falla de radar", "tipo_incidencia": "Falla_Radar", "fecha_reporte": "2026-09-01T14:22:00Z", "fecha_cierre": null, "afecta_recursos": [{"recurso_id": 7}], "retrasa_vuelos": [{"vuelo_id": 1841}]}'
```

**Listar incidencias por tipo y rango de fechas:**
```bash
curl "http://localhost:3003/api/infra/incidencias?tipo=Falla_Radar&desde=2026-09-01T00:00:00Z&hasta=2026-09-08T00:00:00Z"
```

---

## Despliegue

- **Imagen:** el `Dockerfile` produce la imagen `ms3-infraestructura-api`; para producción se publica en **GHCR** vía GitHub Actions (tag `vX.Y`) y el `compose` de las VMs hace `pull` por tag.
- **VMs de producción (2):** API detrás del **balanceador privado** (ALB/NLB interno) + **AWS API Gateway con HTTPS**.
- **BD privada:** MongoDB 7 corre en la **3ra VM privada** (sin IP pública); la `MONGO_URI` se inyecta por variable de entorno.
- **Acceso:** instancias por SSM (sin puerto 22 público); credenciales por `.env` no versionado.

## Documentación relacionada

| Documento | Contenido |
|---|---|
| `docs/requerimientos.md` | Especificación completa del proyecto (rúbrica, alcance, RNF) |
| `docs/plan-de-trabajo.md` | Cronograma, hitos, rangos de ID y reparto de tareas |
| `docs/contratos/enums.md` | Diccionario de enums compartidos entre servicios |
| `docs/README.md` | Diagramas E/R por microservicio y estructuras JSON NoSQL |
| `docs/arquitectura.md` | Arquitectura de red (VPC, SG, balanceador, API Gateway) |
| `INDEX.md` | Índice de repositorios públicos del equipo |

---

## Licencia

MIT