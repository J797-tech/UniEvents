# Estado del proyecto UniEvents

## 1. Resumen ejecutivo

El proyecto UniEvents se encuentra en una etapa de desarrollo de MVP funcional avanzado. La especificación técnica planteada en el documento del proyecto y la implementación actual del repositorio muestran una alta alineación entre diseño y desarrollo: la arquitectura base, la lógica de negocio principal y la interfaz funcional ya han sido construidas.

En términos de madurez, el proyecto se encuentra más cerca de un entregable técnico funcional que de un prototipo inicial. La parte crítica del problema —el control de aforo con concurrencia— ha sido resuelta en la lógica de backend y validada con pruebas específicas.

---

## 2. Estado general del desarrollo

### 2.1 Evaluación general

- Arquitectura base: implementada
- Backend principal: implementado
- Frontend principal: implementado
- Lógica de aforo concurrente: implementada
- Validación de concurrencia: realizada
- Preparación para producción: pendiente

### 2.2 Valoración general

El sistema ya evidencia una solución funcional para la gestión de eventos académicos, inscripción de estudiantes y control del aforo disponible en tiempo real. La implementación resulta coherente con el planteamiento del documento técnico y responde adecuadamente a la necesidad del problema académico descrito.

---

## 3. Cumplimiento frente a la especificación técnica

### 3.1 Requisitos funcionales

#### RF-01: Consultar cartelera
Cumplido.

Evidencia:
- [backend/src/controllers/eventoController.js](../backend/src/controllers/eventoController.js)
- [frontend/src/App.jsx](../frontend/src/App.jsx)

La aplicación muestra la cartelera con fecha, hora, ponente, auditorio, cupos disponibles y otros indicadores relevantes del evento.

#### RF-02: Inscripción de estudiantes
Cumplido.

Evidencia:
- [backend/src/controllers/inscripcionController.js](../backend/src/controllers/inscripcionController.js)

El sistema permite registrar estudiantes ingresando nombre completo, correo institucional y carrera.

#### RF-03: Control automático de aforo
Cumplido.

Evidencia:
- [backend/src/controllers/inscripcionController.js](../backend/src/controllers/inscripcionController.js)

La lógica valida atómicamente la disponibilidad del evento antes de reservar el cupo, evitando sobreventa bajo concurrencia.

#### RF-04: Restricción de duplicados
Cumplido.

Evidencia:
- [backend/src/models/Inscripcion.js](../backend/src/models/Inscripcion.js)

Se implementa un índice único compuesto por `eventoId` y `correo` para impedir que un mismo estudiante se registre más de una vez en el mismo evento.

#### RF-05: Inhabilitación visual
Cumplido.

Evidencia:
- [frontend/src/App.jsx](../frontend/src/App.jsx)

La interfaz refleja el estado del evento y deshabilita la acción de inscripción cuando ya no hay cupos disponibles.

#### RF-06: Gestión de eventos
Cumplido.

Evidencia:
- [backend/src/controllers/eventoController.js](../backend/src/controllers/eventoController.js)
- [frontend/src/App.jsx](../frontend/src/App.jsx)

El sistema permite crear nuevos eventos, definir su capacidad máxima y actualizar la cartelera en consecuencia.

#### RF-07: Generación de reportes
Cumplido.

Evidencia:
- [backend/src/controllers/reporteController.js](../backend/src/controllers/reporteController.js)

El backend expone métricas globales y porcentajes de ocupación por evento para análisis y monitoreo.

### 3.2 Requisitos no funcionales

#### RNF-01: Desempeño
Cumplido en lo esencial.

La lógica de control de aforo se apoya en operaciones atómicas sobre MongoDB, lo que reduce el riesgo de condiciones de carrera y mantiene tiempos de respuesta bajos en escenarios normales de carga.

#### RNF-02: Usabilidad y accesibilidad
Cumplido en lo general.

Evidencia:
- [frontend/src/App.jsx](../frontend/src/App.jsx)

La interfaz presenta una estructura clara, un diseño responsivo y elementos visuales de retroalimentación para mejorar la experiencia del usuario.

#### RNF-03: Concurrencia e integridad
Cumplido y validado.

Evidencia:
- [backend/tests/concurrency.test.js](../backend/tests/concurrency.test.js)

La prueba de concurrencia simula una ráfaga de solicitudes simultáneas y confirma que el sistema no excede la capacidad del evento ni genera inconsistencias persistentes en la base de datos.

---

## 4. Evidencias del repositorio

### 4.1 Backend

- [backend/src/server.js](../backend/src/server.js): arranque y configuración principal del servidor Express.
- [backend/src/config/db.js](../backend/src/config/db.js): conexión a MongoDB.
- [backend/src/models/Evento.js](../backend/src/models/Evento.js): modelo del evento con capacidad y contador de inscritos.
- [backend/src/models/Inscripcion.js](../backend/src/models/Inscripcion.js): modelo de inscripción con restricción de unicidad.
- [backend/src/controllers/inscripcionController.js](../backend/src/controllers/inscripcionController.js): lógica central de inscripción, validación y aforo.
- [backend/src/controllers/reporteController.js](../backend/src/controllers/reporteController.js): cálculo de métricas y reportes globales.
- [backend/tests/concurrency.test.js](../backend/tests/concurrency.test.js): verificación del comportamiento bajo concurrencia.

### 4.2 Frontend

- [frontend/src/App.jsx](../frontend/src/App.jsx): vista principal del sistema y flujo de la aplicación.
- [frontend/src/services/api.js](../frontend/src/services/api.js): cliente HTTP para consumir la API.
- [frontend/package.json](../frontend/package.json): configuración del proyecto frontend.

---

## 5. Pendientes para una versión de producción

Aunque el sistema cumple con la mayoría de los requisitos técnicos y funcionales propuestos, aún existen varios aspectos que deben reforzarse antes de dejarlo listo para producción real:

- configuración formal de variables de entorno
- despliegue real y configuración operativa (Vercel/Render o equivalente)
- autenticación y autorización para coordinadores
- pruebas automatizadas del frontend y pruebas E2E
- validación en entorno real con base de datos en producción
- monitoreo, logging y alertas más robustos
- mejoras de seguridad y documentación operativa

Estos puntos no invalidan el avance actual, sino que reflejan la diferencia entre un MVP funcional y una solución completamente preparada para entorno productivo.

---

## 6. Conclusión

El proyecto UniEvents se encuentra en una etapa sólida de desarrollo y cumple, de manera consistente, con la especificación técnica planteada en el documento original.

La parte más relevante y compleja del problema —el control de aforo bajo concurrencia y la prevención de sobreventa— está implementada y validada. Esto demuestra que el proyecto no es solo una propuesta teórica, sino una solución funcional con lógica real y base de código coherente.

En conclusión:

> El proyecto va muy bien y se encuentra cercano a un MVP funcional entregable, aunque aún requiere refinamientos para pasar a un entorno de producción formal.
