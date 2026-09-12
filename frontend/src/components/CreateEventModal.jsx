import React, { useState } from 'react';
import { 
  CalendarPlus, 
  MapPin, 
  User, 
  Users, 
  Clock, 
  Calendar, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { eventService } from '../services/api';
import { useToast } from '../context/ToastContext';

const AUDITORIOS_SUGERIDOS = [
  { nombre: 'Paraninfo Central - Edificio de Rectoría', capacidadSugerida: 120 },
  { nombre: 'Aula Magna de Ingeniería de Sistemas', capacidadSugerida: 80 },
  { nombre: 'Auditorio 2 - Bloque de Tecnologías', capacidadSugerida: 50 },
  { nombre: 'Auditorio de Posgrados y Humanidades', capacidadSugerida: 60 },
  { nombre: 'Laboratorio de Cómputo Especializado 4B', capacidadSugerida: 25 },
  { nombre: 'Sala de Conferencias Biblioteca Central', capacidadSugerida: 40 }
];

export const CreateEventModal = ({ onEventCreated }) => {
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    titulo: '',
    ponente: '',
    auditorio: AUDITORIOS_SUGERIDOS[0].nombre,
    fechaHora: '',
    cupoMaximo: AUDITORIOS_SUGERIDOS[0].capacidadSugerida
  });
  const [otroAuditorio, setOtroAuditorio] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAuditorioChange = (nombreAuditorio) => {
    if (nombreAuditorio === 'Otro') {
      setFormData(prev => ({ ...prev, auditorio: 'Otro' }));
    } else {
      const seleccionado = AUDITORIOS_SUGERIDOS.find(a => a.nombre === nombreAuditorio);
      setFormData(prev => ({
        ...prev,
        auditorio: nombreAuditorio,
        cupoMaximo: seleccionado ? seleccionado.capacidadSugerida : prev.cupoMaximo
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const auditorioFinal = formData.auditorio === 'Otro' ? otroAuditorio.trim() : formData.auditorio;

    if (!formData.titulo.trim() || !formData.ponente.trim() || !auditorioFinal || !formData.fechaHora) {
      setErrorMsg('Todos los campos son obligatorios.');
      return;
    }

    const cupoNum = parseInt(formData.cupoMaximo, 10);
    if (isNaN(cupoNum) || cupoNum <= 0) {
      setErrorMsg('El aforo máximo debe ser un número entero mayor a 0.');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        titulo: formData.titulo.trim(),
        ponente: formData.ponente.trim(),
        auditorio: auditorioFinal,
        fechaHora: new Date(formData.fechaHora),
        cupoMaximo: cupoNum
      };

      const nuevoEvento = await eventService.createEvento(payload);
      showToast(`¡Evento "${nuevoEvento.titulo}" creado exitosamente!`, 'success');

      // Resetear formulario
      setFormData({
        titulo: '',
        ponente: '',
        auditorio: AUDITORIOS_SUGERIDOS[0].nombre,
        fechaHora: '',
        cupoMaximo: AUDITORIOS_SUGERIDOS[0].capacidadSugerida
      });
      setOtroAuditorio('');

      if (onEventCreated) onEventCreated(nuevoEvento);
    } catch (err) {
      console.error('Error al crear evento:', err);
      const msg = err.data?.message || err.message || 'Error al registrar el evento';
      setErrorMsg(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
        <div className="p-3 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
          <CalendarPlus className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Panel de Coordinación Académica</h2>
          <p className="text-xs text-slate-400">
            Publicación oficial de conferencias, talleres y control de aforo (RF-06)
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
          <div className="leading-snug">{errorMsg}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Título del Evento */}
        <div>
          <label htmlFor="evento-titulo" className="block text-xs font-semibold text-slate-300 mb-1.5">
            Título de la Conferencia / Seminario <span className="text-rose-400">*</span>
          </label>
          <input
            id="evento-titulo"
            type="text"
            required
            placeholder="Ej. Simposio Nacional de Inteligencia Artificial y Big Data"
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>

        {/* Ponente o Expositor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="evento-ponente" className="block text-xs font-semibold text-slate-300 mb-1.5">
              Ponente / Expositor Invitado <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="evento-ponente"
                type="text"
                required
                placeholder="Dr. / Ing. / Mag. Nombre Apellido"
                value={formData.ponente}
                onChange={(e) => setFormData({ ...formData, ponente: e.target.value })}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Fecha y Hora */}
          <div>
            <label htmlFor="evento-fecha" className="block text-xs font-semibold text-slate-300 mb-1.5">
              Fecha y Hora Programada <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                id="evento-fecha"
                type="datetime-local"
                required
                value={formData.fechaHora}
                onChange={(e) => setFormData({ ...formData, fechaHora: e.target.value })}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Recinto / Auditorio y Capacidad Máxima */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="evento-auditorio" className="block text-xs font-semibold text-slate-300 mb-1.5">
              Auditorio / Recinto <span className="text-rose-400">*</span>
            </label>
            <select
              id="evento-auditorio"
              value={formData.auditorio}
              onChange={(e) => handleAuditorioChange(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
            >
              {AUDITORIOS_SUGERIDOS.map((aud) => (
                <option key={aud.nombre} value={aud.nombre} className="bg-slate-900">
                  {aud.nombre} (Cap. {aud.capacidadSugerida})
                </option>
              ))}
              <option value="Otro" className="bg-slate-900">Otro Auditorio / Espacio</option>
            </select>
          </div>

          <div>
            <label htmlFor="evento-cupo" className="block text-xs font-semibold text-slate-300 mb-1.5">
              Capacidad Máxima de Aforo (Cupos) <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="evento-cupo"
                type="number"
                min="1"
                required
                value={formData.cupoMaximo}
                onChange={(e) => setFormData({ ...formData, cupoMaximo: e.target.value })}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Límite estricto de aforo protegido por atomicidad en base de datos.
            </p>
          </div>
        </div>

        {formData.auditorio === 'Otro' && (
          <div>
            <label htmlFor="evento-otro-auditorio" className="block text-xs font-semibold text-slate-300 mb-1.5">
              Nombre del Auditorio Personalizado <span className="text-rose-400">*</span>
            </label>
            <input
              id="evento-otro-auditorio"
              type="text"
              required
              placeholder="Ej. Aula 102 - Edificio Innovación"
              value={otroAuditorio}
              onChange={(e) => setOtroAuditorio(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
        )}

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Guardando Evento...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Publicar Evento en Cartelera</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};

