import React, { useState, useEffect } from 'react';
import { X, Users, Mail, BookOpen, Calendar, Loader2, UserCheck } from 'lucide-react';
import { eventService } from '../services/api';

export const AttendeesModal = ({ evento, onClose }) => {
  const [inscripciones, setInscripciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendees = async () => {
      if (!evento) return;
      try {
        setLoading(true);
        const data = await eventService.getInscripcionesByEvento(evento._id);
        setInscripciones(data.inscripciones || []);
      } catch (err) {
        console.error('Error al obtener inscripciones:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendees();
  }, [evento]);

  if (!evento) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        
        {/* Cabecera */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/40 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Users className="w-4 h-4" />
              <span>Lista de Asistentes Inscritos</span>
            </div>
            <h2 className="text-lg font-bold text-white leading-tight">
              {evento.titulo}
            </h2>
            <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
              <span>Aforo: <strong className="text-white">{evento.totalInscritos} / {evento.cupoMaximo}</strong></span>
              <span>•</span>
              <span className="text-emerald-400 font-medium">{evento.cuposDisponibles} cupos libres restantes</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
            aria-label="Cerrar ventana modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido / Lista */}
        <div className="p-6 overflow-y-auto flex-1 divide-y divide-slate-800/60">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Loader2 className="w-7 h-7 animate-spin text-indigo-500 mb-2" />
              <p className="text-xs">Cargando registros oficiales...</p>
            </div>
          ) : inscripciones.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              Aún no hay estudiantes inscritos en este evento.
            </div>
          ) : (
            inscripciones.map((ins, index) => (
              <div key={ins._id} className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-xs font-bold border border-indigo-500/20">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{ins.nombreEstudiante}</h4>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-500" />
                        {ins.correo}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-slate-500" />
                        {ins.carrera}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right text-[11px] text-slate-400 hidden sm:block">
                  {new Date(ins.fechaRegistro).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pie */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};

