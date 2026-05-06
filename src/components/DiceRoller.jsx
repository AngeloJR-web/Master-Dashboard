import { useState, useEffect } from 'react';

// Mapeamento de Pericias
const SKILL_ATTRIBUTE_MAP = {
  "Acrobacia": "agi", "Adestramento": "pre", "Artes": "pre", "Atletismo": "for", "Atualidades": "int",
  "Ciências": "int", "Crime": "agi", "Diplomacia": "pre", "Enganação": "pre", "Fortitude": "vig",
  "Furtividade": "agi", "Iniciativa": "agi", "Intimidação": "pre", "Intuição": "pre", "Investigação": "int",
  "Luta": "for", "Medicina": "int", "Ocultismo": "int", "Percepção": "pre", "Pilotagem": "agi",
  "Pontaria": "agi", "Profissão": "int", "Reflexos": "agi", "Religião": "pre", "Sobrevivência": "int",
  "Tática": "int", "Tecnologia": "int", "Vontade": "pre"
};

export function DiceRoller({ players }) {
  const [currentRoll, setCurrentRoll] = useState(null);
  const [history, setHistory] = useState([]);
  
  // Estados de controle
  const [diceCount, setDiceCount] = useState(1);
  const [modifier, setModifier] = useState(0);
  
  // Estados de integração
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");

  // Efeito para atualizar dados quando seleciona Agente/Perícia
  useEffect(() => {
    if (selectedPlayerId) {
      const player = players.find(p => p.id === parseInt(selectedPlayerId));
      if (player) {
        if (selectedSkill) {
          // Se tem perícia, pega o atributo dela e o bônus
          const attrKey = SKILL_ATTRIBUTE_MAP[selectedSkill];
          setDiceCount(player.attributes[attrKey] || 1);
          setModifier(player.skills?.[selectedSkill] || 0);
        } else {
          // Se não tem perícia, deixa o mestre ajustar manual
          setModifier(0);
        }
      }
    }
  }, [selectedPlayerId, selectedSkill, players]);

  const rollDice = (sides, diceName) => {
    const rolls = [];
    for (let i = 0; i < diceCount; i++) {
      rolls.push(Math.floor(Math.random() * sides) + 1);
    }
    
    const sumOfDice = rolls.reduce((acc, val) => acc + val, 0);
    const highestDie = Math.max(...rolls);
    const modText = modifier > 0 ? `+${modifier}` : modifier < 0 ? modifier : '';
    
    const newRoll = {
      id: Date.now(),
      playerName: players.find(p => p.id === parseInt(selectedPlayerId))?.name || "Mestre",
      skillName: selectedSkill || diceName,
      expression: `${diceCount}${diceName}${modText}`,
      rolls,
      modifier,
      sides,
      total: sides === 20 ? highestDie + modifier : sumOfDice + modifier,
      isCrit: sides === 20 && rolls.includes(20),
      isFumble: sides === 20 && rolls.includes(1) && highestDie !== 20,
    };

    setCurrentRoll(newRoll);
    setHistory(prev => [newRoll, ...prev].slice(0, 10));
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 backdrop-blur-md">
        
        {/* SELETOR DE AGENTE E PERÍCIA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 bg-zinc-950/50 p-4 rounded-lg border border-zinc-800/50">
          <div>
            <label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest block mb-2">Agente</label>
            <select 
              value={selectedPlayerId} 
              onChange={(e) => setSelectedPlayerId(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-lg px-3 py-2 outline-none focus:border-red-500"
            >
              <option value="">Rolar como Mestre</option>
              {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest block mb-2">Teste de Perícia</label>
            <select 
              value={selectedSkill} 
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-lg px-3 py-2 outline-none focus:border-red-500"
            >
              <option value="">Atributo Puro / Manual</option>
              {Object.keys(SKILL_ATTRIBUTE_MAP).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* CONTROLES MANUAIS */}
        <div className="flex gap-4 mb-8">
          <div className="flex-1">
            <span className="text-zinc-500 text-[10px] font-black uppercase mb-2 block">Dados (Atributo)</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setDiceCount(p => Math.max(1, p-1))} className="w-8 h-8 bg-zinc-800 rounded">-</button>
              <span className="flex-1 text-center font-black text-xl">{diceCount}</span>
              <button onClick={() => setDiceCount(p => p+1)} className="w-8 h-8 bg-zinc-800 rounded">+</button>
            </div>
          </div>
          <div className="flex-1">
            <span className="text-zinc-500 text-[10px] font-black uppercase mb-2 block">Bônus (Perícia)</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setModifier(p => p-1)} className="w-8 h-8 bg-zinc-800 rounded">-</button>
              <span className="flex-1 text-center font-black text-xl">+{modifier}</span>
              <button onClick={() => setModifier(p => p+1)} className="w-8 h-8 bg-zinc-800 rounded">+</button>
            </div>
          </div>
        </div>

        {/* BOTÃO D20 PRINCIPAL */}
        <button 
          onClick={() => rollDice(20, 'D20')}
          className="w-full py-6 mb-6 bg-red-600/20 border border-red-600/50 hover:bg-red-600/40 text-red-100 font-black text-2xl rounded-xl transition-all shadow-[0_0_20px_rgba(220,38,38,0.2)]"
        >
          ROLAR TESTE (D20)
        </button>

        {/* OUTROS DADOS */}
        <div className="grid grid-cols-5 gap-2">
          {[4, 6, 8, 10, 12].map(s => (
            <button key={s} onClick={() => rollDice(s, `D${s}`)} className="py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-xs font-bold text-zinc-400">D{s}</button>
          ))}
        </div>
      </div>

      {/* RESULTADO E HISTÓRICO */}
      <div className="w-full lg:w-96 space-y-6">
        <div className="bg-black border border-zinc-800 rounded-xl p-6 h-64 flex flex-col items-center justify-center relative overflow-hidden">
          {currentRoll ? (
            <div className="text-center z-10 animate-fade-in">
              <p className="text-red-500 text-[10px] font-black uppercase tracking-[0.3em] mb-1">{currentRoll.playerName}</p>
              <p className="text-zinc-500 text-xs font-bold mb-4 italic">{currentRoll.skillName} ({currentRoll.expression})</p>
              <div className={`text-7xl font-black ${currentRoll.isCrit ? 'text-green-500' : currentRoll.isFumble ? 'text-red-600' : 'text-white'}`}>
                {currentRoll.total}
              </div>
              <div className="flex gap-1 justify-center mt-4 flex-wrap">
                {currentRoll.rolls.map((r, i) => (
                  <span key={i} className="text-[10px] font-mono bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-zinc-400">{r}</span>
                ))}
              </div>
            </div>
          ) : <span className="text-zinc-800 font-black text-xl uppercase tracking-widest">Aguardando...</span>}
        </div>
        

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 h-64 overflow-y-auto space-y-2">
          <h3 className="text-[10px] font-black text-zinc-600 uppercase mb-3 tracking-widest">Registros de Rolagem</h3>
          {history.map(h => (
            <div key={h.id} className="flex justify-between items-center bg-zinc-950/50 p-2 rounded border border-zinc-800/30 text-[10px]">
              <span className="text-zinc-400"><b className="text-red-500">{h.playerName}</b> {h.skillName}</span>
              <span className="font-black text-white text-sm">{h.total}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}