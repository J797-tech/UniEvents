import React from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Lock,
  Sparkles
} from 'lucide-react';

export const EventCard = ({ evento, onSelectRegister, onViewAttendees }) => {
  const {
    _id,
    titulo,
    ponente,
    auditorio,
    fechaHora,
    cupoMaximo,
    totalInscritos = 0,
    cuposDisponibles = 0,
    porcentajeOcupacion = 0,
    estaAgotado = false
  } = evento;

  const fechaObj = new Date(fechaHora);
  const fechaFormateada = fechaObj.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  const horaFormateada = fechaObj.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Determinar nivel de ocupación y estilos visuales
  const isSoldOut = estaAgotado || cuposDisponibles <= 0;
  const isAlmostFull = !isSoldOut && (porcentajeOcupacion >= 80 || cuposDisponibles <= 3);

  let statusBadge = {
    text: `${cuposDisponibles} cupos libres`,
    bg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    icon: CheckCircle2
  };

  if (isSoldOut) {
    statusBadge = {
      text: 'Aforo Agotado',
      bg: 'bg-rose-500/15 text-rose-300 border-rose-500/40 font-bold',
      icon: Lock
    };
  } else if (isAlmostFull) {
    statusBadge = {
      text: `¡Últimos ${cuposDisponibles} cupos!`,
      bg: 'bg-amber-500/15 text-amber-300 border-amber-500/40 font-semibold',
      icon: AlertCircle
    };
  }

  const StatusIcon = statusBadge.icon;

  return (
    <div className={`relative flex flex-col justify-between rounded-2xl border transition-all duration-300 overflow-hidden backdrop-blur-md group ${
      isSoldOut
        ? 'bg-slate-900/40 border-slate-800 opacity-90 hover:border-slate-700'
        : 'bg-slate-900/80 border-slate-800 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10'
    }`}>
      
      {/* Indicador de acento superior */}
      <div className={`h-1.5 w-full ${
        isSoldOut
          ? 'bg-rose-500/60'
          : isAlmostFull
          ? 'bg-gradient-to-r from-amber-500 to-rose-500'
          : 'bg-gradient-to-r from-indigo-500 to-sky-500'
      }`} />

      <div className="p-5 sm:p-6 flex-1 flex flex-col">
        
        {/* Encabezado: Insignia de aforo y fecha */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border ${statusBadge.bg}`}>
            <StatusIcon className="w-3.5 h-3.5 flex-shrink-0" />
            {statusBadge.text}
          </span>

          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            {fechaFormateada}
          </span>
        </div>

        {/* Título del Evento */}
        <h3 className="text-lg font-bold text-white leading-snug mb-3 group-hover:text-indigo-300 transition-colors">
          {titulo}
        </h3>

        {/* Detalles del Evento */}
        <div className="space-y-2 text-xs text-slate-300 mb-5">
          <div className="flex items-start gap-2">
            <User className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
            <span className="leading-tight text-slate-200">
              <strong className="text-slate-400 font-normal">Ponente: </strong>
              {ponente}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-sky-400 flex-shrink-0" />
            <span className="truncate">{auditorio}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span>Hora: {horaFormateada}</span>
          </div>
        </div>

        {/* Barra de progreso de aforo */}
        <div className="mt-auto pt-3 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              Ocupación del Auditorio
            </span>
            <span className="font-semibold text-slate-200">
              {totalInscritos} / {cupoMaximo} ({porcentajeOcupacion}%)
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isSoldOut
                  ? 'bg-rose-500'
                  : isAlmostFull
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                  : 'bg-gradient-to-r from-indigo-500 to-sky-400'
              }`}
              style={{ width: `${Math.min(100, porcentajeOcupacion)}%` }}
              role="progressbar"
              aria-valuenow={porcentajeOcupacion}
              aria-valuemin="0"
              aria-valuemax="100"
            />
          </div>
        </div>

      </div>

      {/* Pie de tarjeta: Botón de Acción (RF-05 Inhabilitación visual automática) */}
      <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-2 bg-slate-900/30 flex items-center gap-2">
        <button
          onClick={() => onSelectRegister(evento)}
          disabled={isSoldOut}
          aria-disabled={isSoldOut}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
            isSoldOut
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 active:scale-[0.98]'
          }`}
        >
          {isSoldOut ? (
            <>
              <Lock className="w-4 h-4" />
              <span>Aforo Agotado</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Inscribirme al Evento</span>
            </>
          )}
        </button>

        {onViewAttendees && (
          <button
            onClick={() => onViewAttendees(evento)}
            title="Ver inscritos"
            className="p-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-xs font-medium"
            aria-label={`Ver lista de asistentes para ${titulo}`}
          >
            <Users className="w-4 h-4" />
          </button>
        )}
      </div>

    </div>
  );
};

