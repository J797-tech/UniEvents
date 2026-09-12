import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Mail, 
  BookOpen, 
  Calendar, 
  MapPin, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import { eventService } from '../services/api';
import { useToast } from '../context/ToastContext';

const CARRERAS_PREDETERMINADAS = [
  'Ingeniería de Sistemas',
  'Ingeniería de Software',
  'Ciencia de Datos e IA',
  'Ingeniería Electrónica',
  'Ingeniería Industrial',
  'Ingeniería Mecatrónica',
  'Administración de Empresas',
  'Economía',
  'Medicina',
  'Derecho',
  'Otra Carrera'
];

export const RegistrationModal = ({ evento, onClose, onSuccess }) => {
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    nombreEstudiante: '',
    correo: '',
    carrera: CARRERAS_PREDETERMINADAS[0]
  });
  const [otraCarrera, setOtraCarrera] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Cerrar con la tecla Escape (Accesibilidad WCAG)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!evento) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const carreraFinal = formData.carrera === 'Otra Carrera' 
      ? otraCarrera.trim() 
      : formData.carrera;

    // Validaciones en cliente
    if (!formData.nombreEstudiante.trim()) {
      setErrorMsg('Por favor ingresa tu nombre completo.');
      return;
    }
    if (!formData.correo.trim() || !formData.correo.includes('@')) {
      setErrorMsg('Por favor ingresa un correo electrónico válido.');
      return;
    }
    if (!carreraFinal) {
      setErrorMsg('Por favor especifica tu programa académico o carrera.');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        eventoId: evento._id,
        nombreEstudiante: formData.nombreEstudiante.trim(),
        correo: formData.correo.trim().toLowerCase(),
        carrera: carreraFinal
      };

      const res = await eventService.inscribirEstudiante(payload);

      showToast(`¡Inscripción exitosa a "${evento.titulo}"!`, 'success');
      if (onSuccess) onSuccess(res);
      onClose();
    } catch (err) {
      console.error('Error al registrar inscripción:', err);
      const serverMessage = err.data?.message || err.message || 'Error al procesar la inscripción';

      if (err.status === 409 || err.data?.error === 'DUPLICATE_REGISTRATION') {
        setErrorMsg('Este correo electrónico ya está registrado en este evento. No se permiten inscripciones duplicadas.');
        showToast('El correo ya se encuentra registrado en este evento.', 'warning');
      } else if (err.status === 400 && (err.data?.error === 'AFORO_AGOTADO' || serverMessage.includes('Aforo Agotado'))) {
        setErrorMsg('¡Aforo agotado! Justo se completaron los cupos disponibles.');
        showToast('Lo sentimos, el aforo para este evento se ha agotado.', 'error');
        if (onSuccess) onSuccess(); // Forzar recarga de cartelera
      } else {
        setErrorMsg(serverMessage);
        showToast(serverMessage, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Cabecera del Modal */}
        <div className="relative p-6 border-b border-slate-800 bg-gradient-to-r from-indigo-950/50 via-slate-900 to-slate-900">
          <button
            onClick={onClose}
            disabled={loading}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
            aria-label="Cerrar ventana modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Formulario Oficial de Inscripción</span>
          </div>

          <h2 id="modal-title" className="text-xl font-bold text-white pr-8">
            {evento.titulo}
          </h2>

          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-300">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              {new Date(evento.fechaHora).toLocaleDateString('es-ES', {
                weekday: 'short',
                day: 'numeric',
                month: 'short'
              })}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-sky-400" />
              {evento.auditorio}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-medium">
              {evento.cuposDisponibles} cupos libres
            </span>
          </div>
        </div>

        {/* Mensaje de Error si ocurre */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
            <div className="leading-snug">{errorMsg}</div>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Nombre Completo */}
          <div>
            <label htmlFor="nombreEstudiante" className="block text-xs font-semibold text-slate-300 mb-1.5">
              Nombre Completo del Estudiante <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="nombreEstudiante"
                type="text"
                required
                placeholder="Ej. Carlos Andrés Gómez"
                value={formData.nombreEstudiante}
                onChange={(e) => setFormData({ ...formData, nombreEstudiante: e.target.value })}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Correo Institucional */}
          <div>
            <label htmlFor="correo" className="block text-xs font-semibold text-slate-300 mb-1.5">
              Correo Institucional / Académico <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="correo"
                type="email"
                required
                placeholder="estudiante@universidad.edu.co"
                value={formData.correo}
                onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Restricción RF-04: Solo se permite 1 registro por correo institucional para este evento.
            </p>
          </div>

          {/* Carrera / Programa Académico */}
          <div>
            <label htmlFor="carrera" className="block text-xs font-semibold text-slate-300 mb-1.5">
              Programa Académico / Carrera <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <BookOpen className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <select
                id="carrera"
                value={formData.carrera}
                onChange={(e) => setFormData({ ...formData, carrera: e.target.value })}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none cursor-pointer"
              >
                {CARRERAS_PREDETERMINADAS.map((c) => (
                  <option key={c} value={c} className="bg-slate-900 text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {formData.carrera === 'Otra Carrera' && (
            <div>
              <label htmlFor="otraCarrera" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Especifique su carrera <span className="text-rose-400">*</span>
              </label>
              <input
                id="otraCarrera"
                type="text"
                required
                placeholder="Nombre de la carrera"
                value={otraCarrera}
                onChange={(e) => setOtraCarrera(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
          )}

          {/* Botones de Acción */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Validando Aforo...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmar Inscripción</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

