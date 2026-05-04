import { useState } from 'react';

export function TacticalPanel() {
  const [combatants, setCombatants] = useState([]);
  const [name, setName] = useState('');
  const [initValue, setInitValue] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Adicionar combatente e reordenar a lista automaticamente
  const addCombatant = (e) => {
    e.preventDefault();
    if (!name.trim() || initValue === '') return;

    const newCombatant = {
      id: Date.now(),
      name: name.trim(),
      value: parseInt(initValue, 10),
    };

    // Adiciona e ordena do maior para o menor
    const updatedList = [...combatants, newCombatant].sort((a, b) => b.value - a.value);
    
    setCombatants(updatedList);
    setName('');
    setInitValue('');
    
    // Se a lista estava vazia, o índice começa em 0
    if (combatants.length === 0) setCurrentIndex(0);
  };

  const nextTurn = () => {
    if (combatants.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % combatants.length);
  };

  const removeCombatant = (id) => {
    const updatedList = combatants.filter(c => c.id !== id);
    setCombatants(updatedList);
    // Ajusta o índice para não apontar para o vazio
    if (currentIndex >= updatedList.length) setCurrentIndex(0);
  };

  const clearCombat = () => {
    if (window.confirm("Deseja limpar toda a iniciativa?")) {
      setCombatants([]);
      setCurrentIndex(0);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full">
      
      {/* Lado Esquerdo: Adicionar e Controles */}
      <div className="w-full lg:w-80 space-y-6">
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 backdrop-blur-md shadow-lg">
          <h3 className="text-xl font-bold text-zinc-100 mb-4 border-b border-zinc-800 pb-2 italic">Nova Iniciativa</h3>
          <form onSubmit={addCombatant} className="space-y-4">
            <div>
              <label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest block mb-1">Nome</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Agente ou Monstro" className="w-full bg-zinc-950 border border-zinc-700 text-zinc-100 rounded-lg px-3 py-2 focus:outline-none focus:border-red-500 transition-colors" />
            </div>
            <div>
              <label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest block mb-1">Valor</label>
              <input type="number" value={initValue} onChange={e => setInitValue(e.target.value)} placeholder="Ex: 22" className="w-full bg-zinc-950 border border-zinc-700 text-zinc-100 rounded-lg px-3 py-2 focus:outline-none focus:border-red-500 transition-colors text-center font-bold" />
            </div>
            <button type="submit" className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-100 font-bold rounded-lg transition-all uppercase text-xs tracking-widest">
              + Inserir na Ordem
            </button>
          </form>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 backdrop-blur-md shadow-lg space-y-2">
          <button onClick={nextTurn} disabled={combatants.length === 0} className="w-full py-4 bg-red-900/40 hover:bg-red-800/60 border border-red-700 text-red-100 font-black rounded-lg transition-all uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(220,38,38,0.1)] disabled:opacity-30">
            PRÓXIMO TURNO
          </button>
          <button onClick={clearCombat} className="w-full py-2 text-zinc-600 hover:text-red-500 font-bold text-[10px] uppercase tracking-widest transition-colors">
            Limpar Combate
          </button>
        </div>
      </div>

      {/* Lado Direito: A Fila de Combate */}
      <div className="flex-1 space-y-4">
        {combatants.length === 0 ? (
          <div className="h-64 border-2 border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center bg-zinc-900/20">
            <p className="text-zinc-600 font-bold uppercase tracking-widest">Nenhum combate ativo</p>
          </div>
        ) : (
          <div className="space-y-3">
            {combatants.map((c, index) => {
              const isActive = index === currentIndex;
              return (
                <div 
                  key={c.id} 
                  className={`flex items-center gap-6 p-4 rounded-xl border transition-all duration-500 ${
                    isActive 
                    ? 'bg-red-900/20 border-red-600 shadow-[0_0_30px_rgba(220,38,38,0.15)] translate-x-4' 
                    : 'bg-zinc-900/40 border-zinc-800 opacity-60'
                  }`}
                >
                  {/* Número da Posição */}
                  <div className={`w-10 h-10 flex items-center justify-center rounded font-black text-xl ${isActive ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-600'}`}>
                    {index + 1}
                  </div>

                  {/* Nome e Valor */}
                  <div className="flex-1">
                    <h4 className={`text-xl font-black tracking-tight ${isActive ? 'text-white' : 'text-zinc-400'}`}>
                      {c.name}
                    </h4>
                  </div>

                  <div className={`px-4 py-1 rounded bg-zinc-950 border ${isActive ? 'border-red-600 text-red-500' : 'border-zinc-800 text-zinc-500'} font-mono font-black text-lg`}>
                    {c.value}
                  </div>

                  {/* Ação de Remover */}
                  <button onClick={() => removeCombatant(c.id)} className="text-zinc-700 hover:text-red-500 transition-colors p-2">✕</button>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}