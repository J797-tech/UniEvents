import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  CalendarDays, 
  Sparkles, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2,
  GraduationCap,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { EventCard } from './components/EventCard';
import { RegistrationModal } from './components/RegistrationModal';
import { AttendeesModal } from './components/AttendeesModal';
import { CreateEventModal } from './components/CreateEventModal';
import { MetricsDashboard } from './components/MetricsDashboard';
import { ConcurrencySimulator } from './components/ConcurrencySimulator';
import { eventService } from './services/api';
import { useToast } from './context/ToastContext';

export function App() {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('cartelera');
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');

  // Modales
  const [selectedEventForRegister, setSelectedEventForRegister] = useState(null);
  const [selectedEventForAttendees, setSelectedEventForAttendees] = useState(null);
  const [isReseeding, setIsReseeding] = useState(false);

  // Cargar lista de eventos desde el backend
  const fetchEventos = useCallback(async (showLoadingSpinner = true) => {
    try {
      if (showLoadingSpinner) setLoading(true);
      const params = {};
      if (busqueda.trim()) params.busqueda = busqueda.trim();
      if (filtroEstado !== 'todos') params.estado = filtroEstado;

      const data = await eventService.getEventos(params);
      setEventos(data || []);
    } catch (err) {
      console.error('Error al cargar eventos:', err);
      showToast('Error al conectar con el servidor de UniEvents', 'error');
    } finally {
      if (showLoadingSpinner) setLoading(false);
    }
  }, [busqueda, filtroEstado, showToast]);

  useEffect(() => {
    fetchEventos(true);
  }, [fetchEventos]);

  // Resembrar datos iniciales
  const handleReseed = async () => {
    try {
      setIsReseeding(true);
      await eventService.resembrarDatos();
      showToast('¡Base de datos restaurada con eventos de prueba iniciales!', 'success');
      await fetchEventos(true);
    } catch (err) {
      console.error('Error al resembrar:', err);
      showToast('No se pudieron resembrar los datos', 'error');
    } finally {
      setIsReseeding(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      
      {/* Barra de Navegación Superior */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onReseed={handleReseed}
        isReseeding={isReseeding}
      />

      {/* Contenedor Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* ================= VISTA 1: CARTELERA DE EVENTOS (RF-01, RF-02, RF-05) ================= */}
        {activeTab === 'cartelera' && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Banner Hero */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/20 p-6 sm:p-10 shadow-2xl">
              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  Cartelera Oficial Universitaria
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  Explora y Reserva tu Cupo en Eventos Académicos
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  Sistema centralizado de inscripción en tiempo real con control atómico de aforo, sin riesgo de sobrecupo ni duplicidad.
                </p>
              </div>

              {/* Elementos decorativos */}
              <div className="absolute -right-10 -top-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -right-5 -bottom-5 w-60 h-60 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
            </div>

            {/* Barra de Búsqueda y Filtros */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/80 p-3 sm:p-4 rounded-2xl border border-slate-800 backdrop-blur-md">
              
              {/* Buscador de texto */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar conferencia por título, ponente o auditorio..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>

              {/* Filtros de Disponibilidad */}
              <div className="flex items-center gap-2 overflow-x-auto">
                <Filter className="w-4 h-4 text-slate-400 hidden sm:block flex-shrink-0" />
                <div className="flex items-center gap-1 bg-slate-800/60 p-1 rounded-xl border border-slate-700/60">
                  <button
                    onClick={() => setFiltroEstado('todos')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      filtroEstado === 'todos'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setFiltroEstado('disponibles')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      filtroEstado === 'disponibles'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Con Cupos
                  </button>
                  <button
                    onClick={() => setFiltroEstado('agotados')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      filtroEstado === 'agotados'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Agotados
                  </button>
                </div>
              </div>

            </div>

            {/* Listado de Tarjetas de Eventos */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <RefreshCw className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
                <p className="text-sm">Consultando cartelera de eventos en tiempo real...</p>
              </div>
            ) : eventos.length === 0 ? (
              <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-3xl p-8">
                <CalendarDays className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-1">No se encontraron eventos</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                  Intenta cambiar los términos de búsqueda o los filtros seleccionados.
                </p>
                <button
                  onClick={() => { setBusqueda(''); setFiltroEstado('todos'); }}
                  className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-500 transition-colors"
                >
                  Restablecer Filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {eventos.map((evento) => (
                  <EventCard
                    key={evento._id}
                    evento={evento}
                    onSelectRegister={(ev) => setSelectedEventForRegister(ev)}
                    onViewAttendees={(ev) => setSelectedEventForAttendees(ev)}
                  />
                ))}
              </div>
            )}

          </div>
        )}

        {/* ================= VISTA 2: GESTIÓN DE EVENTOS / COORDINADOR (RF-06) ================= */}
        {activeTab === 'gestion' && (
          <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            <CreateEventModal
              onEventCreated={() => {
                fetchEventos(false);
                setActiveTab('cartelera');
              }}
            />
          </div>
        )}

        {/* ================= VISTA 3: MÉTRICAS Y REPORTES DE AFORO (RF-07) ================= */}
        {activeTab === 'reportes' && (
          <MetricsDashboard
            onViewAttendees={(ev) => setSelectedEventForAttendees(ev)}
          />
        )}

        {/* ================= VISTA 4: SIMULADOR DE CONCURRENCIA (RNF-03) ================= */}
        {activeTab === 'simulador' && (
          <ConcurrencySimulator
            eventos={eventos}
            onRefreshRequired={() => fetchEventos(false)}
          />
        )}

      </main>

      {/* Modales Flotantes */}
      {selectedEventForRegister && (
        <RegistrationModal
          evento={selectedEventForRegister}
          onClose={() => setSelectedEventForRegister(null)}
          onSuccess={() => {
            fetchEventos(false);
          }}
        />
      )}

      {selectedEventForAttendees && (
        <AttendeesModal
          evento={selectedEventForAttendees}
          onClose={() => setSelectedEventForAttendees(null)}
        />
      )}

      {/* Pie de Página */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-950/60 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-slate-300">UniEvents</span>
            <span>— Plataforma Web de Gestión de Eventos Académicos y Control de Aforo</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              RF-01 a RF-07 Implementados
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-sky-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              RNF-01 a RNF-03 Verificados
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}

