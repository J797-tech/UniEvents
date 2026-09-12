# UniEvents – Plataforma Web de Gestión de Eventos Académicos y Control de Aforo

UniEvents es una solución web de arquitectura en 3 capas (React.js + Express.js + MongoDB con Mongoose) desarrollada bajo los más altos estándares de ingeniería de software para automatizar la publicación de carteleras académicas, la inscripción estudiantil y el **control atómico de aforo en tiempo real**, garantizando consistencia absoluta y prevención estricta de condiciones de carrera (*race conditions*) y sobrecupos.

---

## 🏛️ Arquitectura del Sistema (3 Capas Desacopladas)

```
+--------------------+        HTTP/JSON        +-------------------+       Mongoose/BSON       +-----------------+
|   Frontend (SPA)   | <=====================> |   Backend REST    | <=======================> |  MongoDB Atlas  |
| - React 18 + Vite  |                         | - Node.js/Express |                           | - Eventos       |
| - Tailwind CSS     |                         | - Control Atómico |                           | - Inscripciones |
| - WCAG 2.1 A11y    |                         | - Rollback E11000 |                           | - Índices Únicos|
+--------------------+                         +-------------------+                           +-----------------+
```

---

## 📋 Matriz de Cumplimiento de Requisitos

### Requisitos Funcionales (RF)
- **RF-01 (Consultar Cartelera)**: Visualización dinámica de eventos con fecha, hora, ponente, auditorio y cupos disponibles en vivo (`cupoMaximo - totalInscritos`).
- **RF-02 (Inscripción de Estudiantes)**: Registro con nombre completo, correo institucional y carrera académica.
- **RF-03 (Control Automático de Aforo)**: Verificación atómica en base de datos previo a la autorización de la inscripción.
- **RF-04 (Restricción de Duplicados)**: Índice único compuesto `{ eventoId: 1, correo: 1 }` que impide duplicados por estudiante para el mismo evento.
- **RF-05 (Inhabilitación Visual)**: El botón de registro se deshabilita automáticamente y cambia a estado *"Aforo Agotado"* cuando `cuposDisponibles <= 0`.
- **RF-06 (Gestión de Eventos)**: Panel de coordinación para dar de alta nuevos eventos y configurar el aforo del auditorio.
- **RF-07 (Generación de Reportes)**: Dashboard analítico con KPIs globales y desglose porcentual de ocupación por evento.

### Requisitos No Funcionales (RNF)
- **RNF-01 (Desempeño)**: Respuestas de API < 500 ms con consultas optimizadas e índices.
- **RNF-02 (Usabilidad y Accesibilidad)**: Interfaz responsiva con alto contraste, compatible con lectores de pantalla y sistema de notificaciones Toast.
- **RNF-03 (Concurrencia e Integridad)**: Operaciones atómicas condicionales en MongoDB (`$expr`, `$inc`) para eliminar *race conditions*.

---

## 🔒 Lógica de Control Atómico en MongoDB

Para garantizar que múltiples peticiones simultáneas nunca excedan la capacidad máxima:

```javascript
const eventoActualizado = await Evento.findOneAndUpdate(
  {
    _id: eventoId,
    $expr: { $lt: ["$totalInscritos", "$cupoMaximo"] }
  },
  { $inc: { totalInscritos: 1 } },
  { new: true }
);

if (!eventoActualizado) {
  // Aforo agotado en milisegundos concurrentes
  return res.status(400).json({ message: "Aforo Agotado" });
}
```

En caso de fallo al insertar en la colección de `Inscripciones` (por ejemplo, violación de unicidad por correo duplicado con código `11000`), el controlador ejecuta un **rollback atómico**:
```javascript
await Evento.findByIdAndUpdate(eventoId, { $inc: { totalInscritos: -1 } });
```

---

## 🗄️ Diccionario de Datos NoSQL

### Colección: `eventos`
| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `_id` | ObjectId | Sí (Auto) | Identificador único del evento |
| `titulo` | String | Sí | Nombre de la conferencia o taller |
| `ponente` | String | Sí | Nombre del expositor invitado |
| `auditorio` | String | Sí | Recinto o ubicación del evento |
| `fechaHora` | Date | Sí | Fecha y hora programada |
| `cupoMaximo` | Number | Sí | Capacidad máxima del auditorio (> 0) |
| `totalInscritos` | Number | Sí | Contador de inscritos activos (inicia en 0) |
| `creadoEn` | Date | No | Timestamp de creación |

### Colección: `inscripciones`
| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `_id` | ObjectId | Sí (Auto) | Identificador único de inscripción |
| `eventoId` | ObjectId | Sí | Referencia hacia `eventos._id` |
| `nombreEstudiante` | String | Sí | Nombre completo del estudiante |
| `correo` | String | Sí | Correo institucional |
| `carrera` | String | Sí | Programa académico |
| `fechaRegistro` | Date | No | Timestamp de registro |

**Índice Único Compuesto:** `{ eventoId: 1, correo: 1 }` (unique: true)

---

## 🚀 Guía de Instalación y Ejecución Local

### Prerrequisitos
- Node.js (v18 o superior)
- MongoDB Server activo (v6.0 o superior)

### 1. Iniciar el Backend
```bash
cd backend
npm install
npm run seed              # Puebla la base de datos con eventos de muestra
npm run dev               # Inicia el servidor Express en http://localhost:5000
```

### 2. Ejecutar Pruebas Automatizadas de Concurrencia
```bash
cd backend
npm run test:concurrency  # Dispara ráfaga concurrente y verifica atomicidad
```

### 3. Iniciar el Frontend
```bash
cd frontend
npm install
npm run dev               # Inicia la SPA React en http://localhost:5173
```

---

## 📡 Especificación de Endpoints REST

| Método | Endpoint | Body | Descripción | Códigos HTTP |
|---|---|---|---|---|
| `GET` | `/api/eventos` | Ninguno | Obtiene la lista de eventos calculando cupos libres | `200 OK` |
| `POST` | `/api/eventos` | `{ titulo, ponente, auditorio, fechaHora, cupoMaximo }` | Registra un nuevo evento | `201 Created`, `400 Bad Request` |
| `POST` | `/api/inscripciones` | `{ eventoId, nombreEstudiante, correo, carrera }` | Procesa la inscripción con reserva atómica | `201 Created`, `400 Agotado`, `409 Duplicado` |
| `GET` | `/api/reportes/aforo` | Ninguno | Retorna métricas globales y porcentajes de ocupación | `200 OK` |
| `GET` | `/api/inscripciones/evento/:id` | Ninguno | Lista estudiantes inscritos en un evento | `200 OK` |
| `POST` | `/api/seed` | Ninguno | Reinicia la base de datos con datos de prueba | `200 OK` |

