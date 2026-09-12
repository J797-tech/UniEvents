import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  RefreshCw, 
  FileText,
  Search,
  Eye
} from 'lucide-react';
import { eventService } from '../services/api';
import { useToast } from '../context/ToastContext';

export const MetricsDashboard = ({ onViewAttendees }) => {
  const { showToast } = useToast();
  const [reporte, setReporte] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('todos');

  const cargarReporte = async () => {
    try {
      setLoading(true);
      const data = await eventService.getReporteAforo();
      setReporte(data);
    } catch (err) {
      console.error('Error al cargar reporte:', err);
      showToast('Error al cargar las métricas de aforo', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarReporte();
  }, []);

  if (loading && !reporte) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
        <p className="text-sm">Generando métricas y análisis de aforo en tiempo real...</p>
      </div>
    );
  }

  const { metricasGlobales, eventos = [] } = reporte || {};

  const eventosFiltrados = eventos.filter((ev) => {
    const matchText = ev.titulo.toLowerCase().includes(filterText.toLowerCase()) ||
                      ev.auditorio.toLowerCase().includes(filterText.toLowerCase()) ||
                      ev.ponente.toLowerCase().includes(filterText.toLowerCase());
    
    if (selectedEstado === 'agotados') return matchText && ev.estado === 'Agotado';
    if (selectedEstado === 'casiLlenos') return matchText && ev.estado === 'Casi Lleno';
    if (selectedEstado === 'disponibles') return matchText && ev.estado === 'Disponible';
    return matchText;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Encabezado del Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-400" />
            Dashboard de Reportes y Aforo en Tiempo Real (RF-07)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Indicadores agregados de ocupación, capacidad total y métricas de concurrencia
          </p>
        </div>

        <button
          onClick={cargarReporte}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
          <span>Actualizar Métricas</span>
        </button>
      </div>

      {/* Tarjetas de Métricas Globales (KPIs) */}
      {metricasGlobales && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* KPI 1: Eventos Totales */}
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Eventos Ofertados</span>
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-white">
              {metricasGlobales.totalEventos}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
              <span className="text-emerald-400 font-semibold">{metricasGlobales.eventosConCupo} activos</span>
              <span>•</span>
              <span className="text-rose-400 font-semibold">{metricasGlobales.eventosAgotados} agotados</span>
            </div>
          </div>

          {/* KPI 2: Capacidad Total vs Ocupados */}
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Aforo Total Instalado</span>
              <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-white">
              {metricasGlobales.capacidadTotal} <span className="text-xs font-normal text-slate-400">cupos</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {metricasGlobales.cuposDisponiblesGlobal} cupos libres globales
            </div>
          </div>

          {/* KPI 3: Estudiantes Registrados */}
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Inscripciones Totales</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-white">
              {metricasGlobales.totalInscritosGlobal}
            </div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <span>Registros atómicos garantizados</span>
            </div>
          </div>

          {/* KPI 4: Tasa de Ocupación Global */}
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Ocupación Global</span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-white">
              {metricasGlobales.porcentajeOcupacionGlobal}%
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400 h-full rounded-full"
                style={{ width: `${Math.min(100, metricasGlobales.porcentajeOcupacionGlobal)}%` }}
              />
            </div>
          </div>

        </div>
      )}

      {/* Tabla Desglosada de Eventos y Porcentaje de Ocupación */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-md shadow-2xl">
        
        {/* Barra de Filtros de la Tabla */}
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por título, auditorio o ponente..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Estado:</span>
            <select
              value={selectedEstado}
              onChange={(e) => setSelectedEstado(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="todos">Todos los Estados</option>
              <option value="disponibles">Disponibles</option>
              <option value="casiLlenos">Casi Llenos (≥ 80%)</option>
              <option value="agotados">Agotados (100%)</option>
            </select>
          </div>
        </div>

        {/* Tabla Responsiva */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Evento / Ponente</th>
                <th className="py-3.5 px-4">Auditorio</th>
                <th className="py-3.5 px-4 text-center">Aforo Máximo</th>
                <th className="py-3.5 px-4 text-center">Inscritos</th>
                <th className="py-3.5 px-4 text-center">Cupos Libres</th>
                <th className="py-3.5 px-4 min-w-[140px]">Ocupación (%)</th>
                <th className="py-3.5 px-4 text-center">Estado</th>
                <th className="py-3.5 px-4 text-center">Asistentes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {eventosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-500">
                    No se encontraron eventos con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                eventosFiltrados.map((ev) => (
                  <tr key={ev._id} className="hover:bg-slate-800/40 transition-colors">
                    
                    {/* Título y Ponente */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="font-bold text-white max-w-xs sm:max-w-sm truncate">
                        {ev.titulo}
                      </div>
                      <div className="text-slate-400 text-[11px] truncate">
                        {ev.ponente}
                      </div>
                    </td>

                    {/* Auditorio */}
                    <td className="py-4 px-4 text-slate-300">
                      {ev.auditorio}
                    </td>

                    {/* Aforo Máximo */}
                    <td className="py-4 px-4 text-center font-semibold text-slate-200">
                      {ev.cupoMaximo}
                    </td>

                    {/* Inscritos */}
                    <td className="py-4 px-4 text-center font-semibold text-indigo-300">
                      {ev.totalInscritos}
                    </td>

                    {/* Cupos Libres */}
                    <td className="py-4 px-4 text-center font-semibold">
                      <span className={ev.cuposDisponibles === 0 ? 'text-rose-400' : 'text-emerald-400'}>
                        {ev.cuposDisponibles}
                      </span>
                    </td>

                    {/* Barra y % de Ocupación */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              ev.estado === 'Agotado'
                                ? 'bg-rose-500'
                                : ev.estado === 'Casi Lleno'
                                ? 'bg-amber-500'
                                : 'bg-indigo-500'
                            }`}
                            style={{ width: `${Math.min(100, ev.porcentajeOcupacion)}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-200 w-10 text-right">
                          {ev.porcentajeOcupacion}%
                        </span>
                      </div>
                    </td>

                    {/* Estado */}
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                        ev.estado === 'Agotado'
                          ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                          : ev.estado === 'Casi Lleno'
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                      }`}>
                        {ev.estado}
                      </span>
                    </td>

                    {/* Botón Ver Asistentes */}
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => onViewAttendees(ev)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Ver lista de inscritos"
                        aria-label={`Ver lista de inscritos para ${ev.titulo}`}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};

