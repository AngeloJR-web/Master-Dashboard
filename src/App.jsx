import { useState, useEffect } from 'react'
import './App.css'
import { PlayerCard } from './components/PlayerCard'
import { DiceRoller } from './components/DiceRoller'
import { NpcPanel } from './components/NpcPanel'
import { CharacterSheet } from './components/CharacterSheet'
import { TacticalPanel } from './components/TacticalPanel'
import { NotesPanel } from './components/NotesPanel'
import { CharacterCreator } from './components/CharacterCreator'

const INITIAL_PLAYERS = [];

function App() {
  const [activeTab, setActiveTab] = useState('fichas');
  
  // Estado para manter o histórico de rolagens vivo durante a sessão
  const [rollHistory, setRollHistory] = useState([]);

  const [players, setPlayers] = useState(() => {
    const savedPlayers = localStorage.getItem('ordo_alvarus_players');
    if (savedPlayers) {
      try {
        const parsed = JSON.parse(savedPlayers);
        return parsed.map(player => ({
          ...player,
          // Vacina contra tela branca: limpa blobs expirados ao iniciar
          model3d: (player.model3d && player.model3d.startsWith('blob:')) ? null : player.model3d,
          defense: player.defense !== undefined ? player.defense : 10,
          dodge: player.dodge !== undefined ? player.dodge : 10,
          block: player.block !== undefined ? player.block : 0,
          skills: player.skills || {},
          attributes: player.attributes || { agi: 1, for: 1, int: 1, pre: 1, vig: 1 }
        }));
      } catch (e) {
        return INITIAL_PLAYERS;
      }
    }
    return INITIAL_PLAYERS;
  });
  
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const selectedPlayer = players.find(p => p.id === selectedPlayerId);

  useEffect(() => {
    localStorage.setItem('ordo_alvarus_players', JSON.stringify(players));
  }, [players]);

  const handleUpdatePlayer = (updatedPlayer) => {
    setPlayers(players.map(p => p.id === updatedPlayer.id ? updatedPlayer : p));
  };

  const handleSaveNewPlayer = (newPlayer) => {
    setPlayers([...players, newPlayer]);
    setIsCreating(false);
  };

  const handleDeletePlayer = (idToRemove) => {
    if (window.confirm("Confirmar desligamento definitivo do agente?")) {
      setPlayers(players.filter(p => p.id !== idToRemove));
      setSelectedPlayerId(null);
    }
  };

  const resetToDefault = () => {
    if (window.confirm("Deseja resetar o banco de dados? Isso apagará todos os seus agentes criados.")) {
      localStorage.removeItem('ordo_alvarus_players');
      setPlayers(INITIAL_PLAYERS);
    }
  };

  const getTabClass = (tabId) => (
    activeTab === tabId 
    ? "w-full text-left px-4 py-3 rounded-lg bg-red-600/10 border border-red-900/30 text-red-500 font-medium transition-all shadow-inner"
    : "w-full text-left px-4 py-3 rounded-lg text-zinc-400 font-medium transition-all hover:bg-zinc-800/50 hover:text-zinc-200"
  );

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
      
      {/* SIDEBAR ORIGINAL */}
      <aside className="w-72 bg-zinc-900/50 border-r border-zinc-800/80 flex flex-col backdrop-blur-sm z-20">
        <div className="p-6 border-b border-zinc-800/80 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-50"></div>
          <h1 className="text-3xl font-black text-red-600 tracking-widest text-center">ORDO</h1>
          <h1 className="text-xl font-bold text-zinc-100 tracking-widest text-center">ALVARUS</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab('visao')} className={getTabClass('visao')}>Visão Geral</button>
          <button onClick={() => setActiveTab('fichas')} className={getTabClass('fichas')}>Fichas dos Jogadores</button>
          <button onClick={() => setActiveTab('npcs')} className={getTabClass('npcs')}>NPCs e Inimigos</button>
          <button onClick={() => setActiveTab('dados')} className={getTabClass('dados')}>Rolador de Dados</button>
          <button onClick={() => setActiveTab('notas')} className={getTabClass('notas')}>Anotações</button>
        </nav>
        <div className="p-4 border-t border-zinc-800/80 flex flex-col gap-2">
          <button onClick={resetToDefault} className="text-[10px] text-zinc-600 hover:text-red-500 font-bold uppercase tracking-widest transition-colors text-center">Resetar Banco de Dados</button>
          <p className="text-[10px] text-zinc-600 font-mono text-center">Auto-Save: Ativado</p>
        </div>
      </aside>

      {/* ÁREA DE CONTEÚDO ORIGINAL */}
      <main className="flex-1 p-10 overflow-y-auto relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 to-zinc-950">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-96 bg-red-900/5 blur-[120px] pointer-events-none rounded-full"></div>

        {activeTab === 'visao' && <div className="relative z-10 animate-fade-in"><TacticalPanel /></div>}
        
        {activeTab === 'fichas' && (
          <div className="relative z-10 animate-fade-in">
            <header className="mb-10 border-b border-zinc-800/50 pb-6">
              <h2 className="text-4xl font-black text-zinc-100 tracking-tighter">Agentes Registrados</h2>
              <p className="text-zinc-500 mt-2 font-medium">Gerencie a equipe ou inicie o protocolo de criação de um novo investigador.</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {players.map(p => (
                <PlayerCard key={p.id} player={p} onOpenDetails={() => setSelectedPlayerId(p.id)} />
              ))}
              
              <div 
                onClick={() => setIsCreating(true)} 
                className="group bg-zinc-900/30 border-2 border-dashed border-zinc-800 rounded-xl p-5 flex flex-col items-center justify-center gap-4 hover:border-red-600/50 hover:bg-red-900/5 transition-all cursor-pointer min-h-[200px]"
              >
                <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center group-hover:border-red-500 group-hover:bg-red-950/30 transition-colors">
                  <span className="text-zinc-600 text-3xl font-black group-hover:text-red-500">+</span>
                </div>
                <h3 className="text-lg font-bold text-zinc-500 group-hover:text-red-400 transition-colors uppercase tracking-widest text-center">Criar Agente<br/><span className="text-xs text-zinc-600">do zero</span></h3>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'npcs' && <div className="relative z-10 animate-fade-in"><NpcPanel /></div>}
        
        {activeTab === 'dados' && (
          <div className="relative z-10 animate-fade-in">
            <DiceRoller 
              players={players} 
              history={rollHistory} 
              setHistory={setRollHistory} 
            />
          </div>
        )}

        {activeTab === 'notas' && <div className="relative z-10 animate-fade-in h-full"><NotesPanel /></div>}
      </main>

      <CharacterSheet 
        player={selectedPlayer} 
        onClose={() => setSelectedPlayerId(null)} 
        onSave={handleUpdatePlayer}
        onDelete={handleDeletePlayer}
      />

      {isCreating && (
        <CharacterCreator 
          onClose={() => setIsCreating(false)}
          onSave={handleSaveNewPlayer}
        />
      )}

    </div>
  )
}

export default App