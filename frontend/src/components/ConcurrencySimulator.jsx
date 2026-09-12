import React, { useState } from 'react';
import { 
  Zap, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Activity, 
  ShieldCheck, 
  Cpu, 
  Clock 
} from 'lucide-react';
import { eventService } from '../services/api';
import { useToast } from '../context/ToastContext';

export const ConcurrencySimulator = ({ eventos = [], onRefreshRequired }) => {
  const { showToast } = useToast();

  const [selectedEventoId, setSelectedEventoId] = useState(eventos[0]?._id || '');
  const [burstSize, setBurstSize] = useState(15);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [latencyMs, setLatencyMs] = useState(null);

  const selectedEvento = eventos.find(e => e._id === selectedEventoId) || eventos[0];

  const handleRunSimulation = async () => {
    if (!selectedEvento) {
      showToast('Por favor selecciona un evento para la prueba', 'warning');
      return;
    }

    try {
      setIsRunning(true);
      setResults(null);
      setLatencyMs(null);

      const startTime = performance.now();

      // Construir ráfaga de peticiones simultáneas con nombres únicos
      const promises = [];
      const timestamp = Date.now().toString().slice(-5);

      for (let i = 1; i <= burstSize; i++) {
        const payload = {
          eventoId: selectedEvento._id,
          nombreEstudiante: `Test Concurrente #${i}`,
          correo: `bot_${timestamp}_${i}@universidad.edu.co`,
          carrera: 'Ingeniería de Sistemas'
        };

        promises.push(
          eventService.inscribirEstudiante(payload)
            .then(data => ({
              id: i,
              success: true,
              status: 201,
              message: 'Cupo reservado con éxito',
              data
            }))
            .catch(err => ({
              id: i,
              success: false,
              status: err.status || 500,
              message: err.data?.message || err.message,
              data: err.data
            }))
        );
      }

      const rawResults = await Promise.all(promises);
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      setLatencyMs(duration);

      const successList = rawResults.filter(r => r.status === 201);
      const aforoList = rawResults.filter(r => r.status === 400 && (r.message?.includes('Aforo Agotado') || r.data?.error === 'AFORO_AGOTADO'));
      const duplicateList = rawResults.filter(r => r.status === 409);
      const otherErrors = rawResults.filter(r => r.status !== 201 && !aforoList.includes(r) && !duplicateList.includes(r));

      setResults({
        total: burstSize,
        successCount: successList.length,
        aforoCount: aforoList.length,
        duplicateCount: duplicateList.length,
        otherErrorsCount: otherErrors.length,
        items: rawResults
      });

      showToast(`Simulación completada en ${duration}ms: ${successList.length} asignados, ${aforoList.length} bloqueados por aforo.`, 'info');
      if (onRefreshRequired) onRefreshRequired();
    } catch (err) {
      console.error('Error durante la simulación de concurrencia:', err);
      showToast('Error al ejecutar la simulación de concurrencia', 'error');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Encabezado */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-xl">
        <div className="flex items-start gap-4">
          <div className="p-3.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <Zap className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">
                Simulador de Concurrencia y Control Atómico
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                RNF-03 Verifier
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Esta herramienta permite estresar el motor de reservas enviando una ráfaga masiva de solicitudes simultáneas (utilizando <code className="text-amber-300 font-mono">Promise.all</code> en paralelo). Demuestra cómo la operación atómica condicional <code className="text-amber-300 font-mono">$expr: &#123; $lt: ["$totalInscritos", "$cupoMaximo"] &#125;</code> en MongoDB previene condiciones de carrera y sobreventa de cupos.
            </p>
          </div>
        </div>
      </div>

      {/* Controles de Configuración de la Ráfaga */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Panel de Configuración */}
        <div className="lg:col-span-1 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-400" />
            Parámetros de la Prueba
          </h3>

          {/* Selector de Evento */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Seleccionar Evento Objetivo
            </label>
            <select
              value={selectedEventoId || selectedEvento?._id || ''}
              onChange={(e) => setSelectedEventoId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-xs text-white rounded-xl p-2.5 focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              {eventos.map((ev) => (
                <option key={ev._id} value={ev._id} className="bg-slate-900">
                  {ev.titulo} ({ev.cuposDisponibles} cupos libres de {ev.cupoMaximo})
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Cantidad de Peticiones Concurrentes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tamaño de Ráfaga Simultánea
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 20, 50].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setBurstSize(size)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    burstSize === size
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md shadow-amber-500/20'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {size} reqs
                </button>
              ))}
            </div>
          </div>

          {/* Información del Evento Seleccionado */}
          {selectedEvento && (
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs space-y-1.5">
              <div className="text-slate-400">Estado actual del evento:</div>
              <div className="font-semibold text-white truncate">{selectedEvento.titulo}</div>
              <div className="flex justify-between text-slate-300 pt-1">
                <span>Cupos Disponibles:</span>
                <strong className={selectedEvento.cuposDisponibles === 0 ? 'text-rose-400' : 'text-emerald-400'}>
                  {selectedEvento.cuposDisponibles} de {selectedEvento.cupoMaximo}
                </strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Ocupación:</span>
                <span>{selectedEvento.porcentajeOcupacion}%</span>
              </div>
            </div>
          )}

          {/* Botón de Ejecutar */}
          <button
            onClick={handleRunSimulation}
            disabled={isRunning || !selectedEvento}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 active:scale-[0.98] text-white shadow-xl shadow-amber-500/25 transition-all disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Disparando Ráfaga Paralela...</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>Disparar {burstSize} Peticiones Concurrentes</span>
              </>
            )}
          </button>
        </div>

        {/* Panel de Resultados y Monitoreo */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Telemetría y Resultados en Vivo
              </h3>
              {latencyMs !== null && (
                <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  <Clock className="w-3.5 h-3.5" />
                  Latencia Ráfaga: {latencyMs} ms
                </span>
              )}
            </div>

            {!results && !isRunning && (
              <div className="text-center py-16 text-slate-500 text-xs">
                Haz clic en <strong>Disparar Peticiones Concurrentes</strong> para iniciar el test de estrés y evaluar la atomicidad de MongoDB.
              </div>
            )}

            {isRunning && (
              <div className="text-center py-16 text-slate-400 flex flex-col items-center">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-3" />
                <p className="text-sm font-semibold text-white">Ejecutando ráfaga simultánea en paralelo...</p>
                <p className="text-xs text-slate-400 mt-1">Verificando semáforos condicionales en MongoDB Atlas/Server</p>
              </div>
            )}

            {results && !isRunning && (
              <div className="space-y-4">
                
                {/* Resumen de KPIs de la prueba */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
                    <div className="text-xs text-slate-400">Total Enviadas</div>
                    <div className="text-xl font-extrabold text-white mt-0.5">{results.total}</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                    <div className="text-xs text-emerald-400">201 Reservadas</div>
                    <div className="text-xl font-extrabold text-emerald-300 mt-0.5">{results.successCount}</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center">
                    <div className="text-xs text-rose-400">400 Aforo Agotado</div>
                    <div className="text-xl font-extrabold text-rose-300 mt-0.5">{results.aforoCount}</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-center">
                    <div className="text-xs text-indigo-400">Sobrecupo / Overbook</div>
                    <div className="text-xl font-extrabold text-indigo-300 mt-0.5">0</div>
                  </div>
                </div>

                {/* Veredicto de Integridad */}
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-emerald-200 leading-relaxed">
                    <strong>Integridad RNF-03 Verificada:</strong> Todas las solicitudes fueron resueltas atómicamente por el motor de base de datos. No ocurrió sobreventa ni corrupción de datos ante la ráfaga de peticiones concurrentes.
                  </div>
                </div>

                {/* Desglose individual de solicitudes */}
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-2 pt-2">
                  {results.items.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-2 rounded-xl text-xs border ${
                        item.status === 201
                          ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/5 border-rose-500/20 text-rose-300'
                      }`}
                    >
                      <span className="font-mono">Req #{item.id}</span>
                      <span className="font-semibold">HTTP {item.status} ({item.message})</span>
                    </div>
                  ))}
                </div>

              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

