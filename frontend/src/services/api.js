const API_BASE_URL = '/api';

/**
 * Helper para peticiones HTTP centralizadas con manejo de errores
 */
async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.message || 'Error en la petición al servidor');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const eventService = {
  // Obtener cartelera de eventos
  getEventos: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.busqueda) query.append('busqueda', params.busqueda);
    if (params.estado) query.append('estado', params.estado);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return fetchApi(`/eventos${queryString}`);
  },

  // Obtener detalle de un evento por ID
  getEventoById: async (id) => {
    return fetchApi(`/eventos/${id}`);
  },

  // Crear nuevo evento (Coordinadores)
  createEvento: async (eventoData) => {
    return fetchApi('/eventos', {
      method: 'POST',
      body: JSON.stringify(eventoData)
    });
  },

  // Registrar inscripción de estudiante
  inscribirEstudiante: async (inscripcionData) => {
    return fetchApi('/inscripciones', {
      method: 'POST',
      body: JSON.stringify(inscripcionData)
    });
  },

  // Obtener inscripciones de un evento
  getInscripcionesByEvento: async (eventoId) => {
    return fetchApi(`/inscripciones/evento/${eventoId}`);
  },

  // Obtener reporte de aforo y métricas
  getReporteAforo: async () => {
    return fetchApi('/reportes/aforo');
  },

  // Resembrar base de datos
  resembrarDatos: async () => {
    return fetchApi('/seed', {
      method: 'POST'
    });
  }
};

