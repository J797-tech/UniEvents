import React from 'react';
import { 
  GraduationCap, 
  CalendarDays, 
  PlusCircle, 
  BarChart3, 
  Zap, 
  RotateCcw,
  Sparkles
} from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab, onReseed, isReseeding }) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logotipo y Título */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-sky-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  UniEvents
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  v1.0
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Control de Aforo y Gestión de Eventos Académicos
              </p>
            </div>
          </div>

          {/* Navegación por pestañas */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800" role="tablist">
            <button
              role="tab"
              aria-selected={activeTab === 'cartelera'}
              onClick={() => setActiveTab('cartelera')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'cartelera'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              Cartelera
            </button>

            <button
              role="tab"
              aria-selected={activeTab === 'gestion'}
              onClick={() => setActiveTab('gestion')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'gestion'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              Gestión (Coordinador)
            </button>

            <button
              role="tab"
              aria-selected={activeTab === 'reportes'}
              onClick={() => setActiveTab('reportes')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'reportes'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Reportes & Aforo
            </button>

            <button
              role="tab"
              aria-selected={activeTab === 'simulador'}
              onClick={() => setActiveTab('simulador')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'simulador'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-300" />
              Simulador Concurrencia
            </button>
          </nav>

          {/* Acciones Rápidas */}
          <div className="flex items-center gap-2">
            <button
              onClick={onReseed}
              disabled={isReseeding}
              title="Restaurar datos de prueba iniciales"
              className="flex items-center gap-1.5 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700/60 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isReseeding ? 'animate-spin text-indigo-400' : ''}`} />
              <span className="hidden sm:inline">Restablecer Datos</span>
            </button>
          </div>

        </div>

        {/* Barra de navegación inferior para dispositivos móviles */}
        <div className="flex md:hidden border-t border-slate-800 py-2 gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('cartelera')}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-medium ${
              activeTab === 'cartelera' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            Cartelera
          </button>
          <button
            onClick={() => setActiveTab('gestion')}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-medium ${
              activeTab === 'gestion' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Gestión
          </button>
          <button
            onClick={() => setActiveTab('reportes')}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-medium ${
              activeTab === 'reportes' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Reportes
          </button>
          <button
            onClick={() => setActiveTab('simulador')}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-medium ${
              activeTab === 'simulador' ? 'bg-amber-600 text-white' : 'text-slate-400'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Simulador
          </button>
        </div>

      </div>
    </header>
  );
};

