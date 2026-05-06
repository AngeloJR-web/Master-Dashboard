import { useState, useEffect } from 'react'
import './App.css'
import { PlayerCard } from './components/PlayerCard'
import { DiceRoller } from './components/DiceRoller'
import { NpcPanel } from './components/NpcPanel'
import { CharacterSheet } from './components/CharacterSheet'
import { TacticalPanel } from './components/TacticalPanel'
import { NotesPanel } from './components/NotesPanel'
import { CharacterCreator } from './components/CharacterCreator'
import { BattleMap } from './components/BattleMap'
import { SettingsPanel } from './components/SettingsPanel'

const INITIAL_PLAYERS = [];

function App() {
  const [activeTab, setActiveTab] = useState('fichas');
  const [rollHistory, setRollHistory] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ==========================================
  // ESTADOS DE CONFIGURAÇÃO (TEMA E UI)
  // ==========================================
  const [themeColor, setThemeColor] = useState(() => localStorage.getItem('ordo_theme_color') || 'red');
  const [uiScale, setUiScale] = useState(() => parseFloat(localStorage.getItem('ordo_ui_scale')) || 1);
  const [gmName, setGmName] = useState(() => localStorage.getItem('ordo_gm_name') || 'Mestre');
  const [showScanlines, setShowScanlines] = useState(() => localStorage.getItem('ordo_show_scanlines') !== 'false');

  useEffect(() => {
    localStorage.setItem('ordo_theme_color', themeColor);
    localStorage.setItem('ordo_ui_scale', uiScale);
    localStorage.setItem('ordo_gm_name', gmName);
    localStorage.setItem('ordo_show_scanlines', showScanlines);
    document.body.className = `theme-${themeColor}`;
  }, [themeColor, uiScale, gmName, showScanlines]);

  const themeClasses = {
    red: { text: 'text-red-500', bg: 'bg-red-600/10', border: 'border-red-900/30', glow: 'bg-red-900/5' },
    blue: { text: 'text-blue-500', bg: 'bg-blue-600/10', border: 'border-blue-900/30', glow: 'bg-blue-900/5' },
    green: { text: 'text-green-500', bg: 'bg-green-600/10', border: 'border-green-900/30', glow: 'bg-green-900/5' },
    yellow: { text: 'text-yellow-500', bg: 'bg-yellow-600/10', border: 'border-yellow-900/30', glow: 'bg-yellow-900/5' },
    purple: { text: 'text-purple-500', bg: 'bg-purple-600/10', border: 'border-purple-900/30', glow: 'bg-purple-900/5' }
  };
  const activeTheme = themeClasses[themeColor];

  // ==========================================
  // DADOS DOS JOGADORES
  // ==========================================
  const [players, setPlayers] = useState(() => {
    const savedPlayers = localStorage.getItem('ordo_alvarus_players');
    if (savedPlayers) {
      try {
        const parsed = JSON.parse(savedPlayers);
        return parsed.map(player => ({
          ...player,
          model3d: (player.model3d && player.model3d.startsWith('blob:')) ? null : player.model3d,
          skills: player.skills || {},
          attributes: player.attributes || { agi: 1, for: 1, int: 1, pre: 1, vig: 1 }
        }));
      } catch (e) { return INITIAL_PLAYERS; }
    }
    return INITIAL_PLAYERS;
  });
  
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const selectedPlayer = players.find(p => p.id === selectedPlayerId);

  useEffect(() => {
    localStorage.setItem('ordo_alvarus_players', JSON.stringify(players));
  }, [players]);

  const handleUpdatePlayer = (updatedPlayer) => setPlayers(players.map(p => p.id === updatedPlayer.id ? updatedPlayer : p));
  const handleSaveNewPlayer = (newPlayer) => { setPlayers([...players, newPlayer]); setIsCreating(false); };
  const handleDeletePlayer = (idToRemove) => {
    if (window.confirm("Confirmar desligamento definitivo do agente?")) {
      setPlayers(players.filter(p => p.id !== idToRemove));
      setSelectedPlayerId(null);
    }
  };

  const getTabClass = (tabId) => (
    activeTab === tabId 
    ? `w-full text-left px-4 py-3 rounded-lg ${activeTheme.bg} border ${activeTheme.border} ${activeTheme.text} font-black uppercase tracking-widest transition-all shadow-inner text-sm`
    : "w-full text-left px-4 py-3 rounded-lg text-zinc-500 font-bold uppercase tracking-widest transition-all hover:bg-zinc-800/50 hover:text-zinc-200 text-sm"
  );

  return (
    // APLICANDO O ZOOM GLOBAL DA UI AQUI
    <div className="flex h-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden selection:bg-zinc-700 relative" style={{ zoom: uiScale }}>
      
      {/* EFEITO DE SCANLINES (Opcional via Config) */}
      {showScanlines && <div className="pointer-events-none fixed inset-0 z-[100] bg-scanlines opacity-[0.03]"></div>}

      <header className="lg:hidden absolute top-0 left-0 w-full h-16 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-4 z-40 shadow-md">
        <div className="flex items-center gap-2">
          <h1 className={`text-xl font-black ${activeTheme.text} tracking-widest`}>ORDO</h1>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`w-10 h-10 rounded border transition-colors flex items-center justify-center ${isSidebarOpen ? `bg-zinc-800 border-zinc-600 ${activeTheme.text}` : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}>
          <i className={`fa-solid ${isSidebarOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
        </button>
      </header>

      {isSidebarOpen && <div className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30" onClick={() => setIsSidebarOpen(false)}></div>}

      <aside className={`fixed lg:relative top-0 left-0 h-full w-72 bg-zinc-900/95 lg:bg-zinc-900/50 backdrop-blur-xl border-r border-zinc-800/80 flex flex-col z-40 shadow-2xl transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0 mt-16 lg:mt-0 h-[calc(100%-4rem)]' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="hidden lg:flex p-8 border-b border-zinc-800/80 flex-col items-center justify-center">
          <h1 className={`text-4xl font-black ${activeTheme.text} tracking-[0.3em] drop-shadow-lg`}>ORDO</h1>
          <h2 className="text-xl font-bold text-zinc-300 tracking-[0.4em] opacity-80 mt-1">ALVARUS</h2>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button onClick={() => setActiveTab('visao')} className={getTabClass('visao')}><i className="fa-solid fa-bolt w-6 mr-2"></i> Iniciativa</button>
          <button onClick={() => setActiveTab('mapa')} className={getTabClass('mapa')}><i className="fa-solid fa-map-location-dot w-6 mr-2"></i> Mapa Interativo</button>
          <button onClick={() => setActiveTab('fichas')} className={getTabClass('fichas')}><i className="fa-solid fa-id-card w-6 mr-2"></i> Agentes</button>
          <button onClick={() => setActiveTab('npcs')} className={getTabClass('npcs')}><i className="fa-solid fa-skull w-6 mr-2"></i> Inimigos</button>
          <button onClick={() => setActiveTab('dados')} className={getTabClass('dados')}><i className="fa-solid fa-dice-d20 w-6 mr-2"></i> Rolagem Dados</button>
          <button onClick={() => setActiveTab('notas')} className={getTabClass('notas')}><i className="fa-solid fa-folder-open w-6 mr-2"></i> Anotações</button>
        </nav>
        
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/30">
          <button onClick={() => setActiveTab('config')} className={`w-full py-3 rounded-lg border border-zinc-800 font-bold uppercase tracking-widest text-[10px] transition-colors flex items-center justify-center gap-2 ${activeTab === 'config' ? `bg-zinc-800 text-white` : `text-zinc-500 hover:bg-zinc-900`}`}>
            <i className="fa-solid fa-gear"></i> Configurações
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-10 overflow-y-auto relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 to-zinc-950 mt-16 lg:mt-0">
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-96 ${activeTheme.glow} blur-[120px] pointer-events-none rounded-full`}></div>

        {activeTab === 'visao' && <div className="relative z-10 animate-fade-in h-full"><TacticalPanel players={players} /></div>}
        {activeTab === 'mapa' && <div className="relative z-10 animate-fade-in h-[calc(100vh-6rem)] lg:h-full"><BattleMap players={players} /></div>}
        {activeTab === 'fichas' && (
          <div className="relative z-10 animate-fade-in max-w-7xl mx-auto">
            <header className="mb-10 border-b border-zinc-800/50 pb-6">
              <h2 className="text-4xl font-black text-zinc-100 tracking-tighter">Agentes Registrados</h2>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {players.map(p => <PlayerCard key={p.id} player={p} onOpenDetails={() => setSelectedPlayerId(p.id)} />)}
              <div onClick={() => setIsCreating(true)} className={`group bg-zinc-900/30 border-2 border-dashed border-zinc-800 rounded-xl p-5 flex flex-col items-center justify-center gap-4 hover:${activeTheme.border} transition-all cursor-pointer min-h-[200px]`}>
                <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center transition-colors"><span className={`text-zinc-600 text-3xl font-black group-hover:${activeTheme.text}`}>+</span></div>
                <h3 className="text-lg font-bold text-zinc-500 uppercase tracking-widest text-center">Criar Agente</h3>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'npcs' && <div className="relative z-10 animate-fade-in"><NpcPanel /></div>}
        {activeTab === 'dados' && <div className="relative z-10 animate-fade-in"><DiceRoller players={players} history={rollHistory} setHistory={setRollHistory} gmName={gmName} /></div>}
        {activeTab === 'notas' && <div className="relative z-10 animate-fade-in h-full"><NotesPanel /></div>}
        
        {activeTab === 'config' && (
          <div className="relative z-10 animate-fade-in h-full">
            <SettingsPanel 
              themeColor={themeColor} setThemeColor={setThemeColor} 
              uiScale={uiScale} setUiScale={setUiScale}
              gmName={gmName} setGmName={setGmName}
              showScanlines={showScanlines} setShowScanlines={setShowScanlines}
              setPlayers={setPlayers}
            />
          </div>
        )}
      </main>

      <CharacterSheet player={selectedPlayer} onClose={() => setSelectedPlayerId(null)} onSave={handleUpdatePlayer} onDelete={handleDeletePlayer} />
      {isCreating && <CharacterCreator onClose={() => setIsCreating(false)} onSave={handleSaveNewPlayer} />}
    </div>
  )
}

export default App