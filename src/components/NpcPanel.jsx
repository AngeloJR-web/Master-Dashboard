import { useState, useEffect } from 'react';

const DAMAGE_TYPES = [
  "Físico", "Balístico", "Corte", "Impacto", "Perfuração",
  "Sangue", "Morte", "Energia", "Conhecimento", "Medo"
];

// ==========================================
// SUB-COMPONENTE: MODAL DE DETALHES DO NPC
// ==========================================
function NpcDetailsModal({ npc, onClose, onUpdateHp }) {
  const [damageInput, setDamageInput] = useState('');
  const [selectedDmgType, setSelectedDmgType] = useState('Físico');
  const [rollResult, setRollResult] = useState(null);
  
  if (!npc) return null;

  const hpPercent = Math.max(0, Math.min(100, (npc.currentHp / npc.maxHp) * 100)) || 0;
  const isDead = npc.currentHp <= 0;

  // Função segura para buscar atributos (evita crash se for um monstro antigo)
  const getAttr = (attr) => npc.attributes?.[attr] || 1;

  const rollNpcDice = (count, bonus, label) => {
    const diceCount = Math.max(1, count || 1);
    const rolls = [];
    for (let i = 0; i < diceCount; i++) {
      rolls.push(Math.floor(Math.random() * 20) + 1);
    }
    const highest = Math.max(...rolls);
    const total = highest + (parseInt(bonus) || 0);

    setRollResult({
      label,
      rolls,
      total,
      isCrit: rolls.includes(20),
      isFumble: rolls.includes(1) && highest !== 20
    });
  };

  const applyDamage = (useResistence) => {
    const val = parseInt(damageInput, 10);
    if (isNaN(val) || val <= 0) return;
    let finalDamage = val;
    if (useResistence) {
      const rd = npc.resistances?.find(r => r.type === selectedDmgType)?.value || 0;
      finalDamage = Math.max(0, val - rd);
    }
    onUpdateHp(npc.id, -finalDamage);
    setDamageInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className={`relative w-full max-w-4xl bg-zinc-950 border ${isDead ? 'border-red-900' : 'border-zinc-800'} rounded-2xl overflow-hidden shadow-2xl animate-fade-in flex flex-col md:flex-row max-h-[90vh]`}>
        
        {/* Coluna da Esquerda: Dados e Combate */}
        <div className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto">
          <header className="flex justify-between items-start">
            <div>
              <h2 className={`text-3xl font-black uppercase ${isDead ? 'text-red-600 line-through' : 'text-zinc-100'}`}>{npc.name}</h2>
              <span className="text-zinc-500 font-bold text-xs tracking-widest uppercase">
                {isDead ? 'Ameaça Neutralizada' : `VD ${npc.vd || '??'}`}
              </span>
            </div>
            <button onClick={onClose} className="w-10 h-10 shrink-0 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 flex items-center justify-center font-bold">✕</button>
          </header>

          <section>
            <h3 className="text-zinc-600 text-[9px] font-black uppercase tracking-widest mb-3 italic">Testes de Atributo (Clique para rolar)</h3>
            <div className="grid grid-cols-5 gap-2">
              {['agi', 'for', 'int', 'pre', 'vig'].map(attr => (
                <button 
                  key={attr} 
                  onClick={() => !isDead && rollNpcDice(getAttr(attr), 0, attr)}
                  className={`bg-zinc-900 border border-zinc-800 p-2 rounded-lg text-center transition-all ${!isDead && 'hover:border-red-600 hover:bg-red-900/10'}`}
                >
                  <span className="block text-[8px] text-zinc-500 font-bold uppercase">{attr}</span>
                  <span className="text-xl font-black text-zinc-100">{getAttr(attr)}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-lg p-4">
              <h3 className="text-zinc-600 text-[9px] font-black uppercase tracking-widest mb-3 italic">Ações e Ataques</h3>
              <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                {npc.actions?.length > 0 ? npc.actions.map((action, i) => (
                  <button 
                    key={i}
                    onClick={() => !isDead && rollNpcDice(getAttr(action.attr), action.bonus, action.name)}
                    className="w-full flex justify-between items-center p-2 bg-zinc-900/80 border border-zinc-700/50 rounded hover:border-red-500/50 hover:bg-zinc-800 transition-all text-xs group"
                  >
                    <span className="text-zinc-300 font-bold">{action.name}</span>
                    <span className="text-red-500 font-black group-hover:scale-110 transition-transform">+{action.bonus}</span>
                  </button>
                )) : <p className="text-[10px] text-zinc-600 italic">Sem ataques cadastrados.</p>}
              </div>
            </div>

            <div className="bg-zinc-900/30 border border-zinc-800 rounded-lg p-4">
              <h3 className="text-zinc-600 text-[9px] font-black uppercase tracking-widest mb-3 italic">Resistências (RD)</h3>
              <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto pr-1">
                {npc.resistances?.length > 0 ? npc.resistances.map((res, i) => (
                  <span key={i} className="bg-blue-900/20 border border-blue-800 text-blue-400 px-2 py-1 rounded text-[10px] font-bold">
                    RD {res.value} {res.type}
                  </span>
                )) : <p className="text-[10px] text-zinc-600 italic">Sem resistências cadastradas.</p>}
              </div>
            </div>
          </section>

          <section className="space-y-3 pt-4 border-t border-zinc-900">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
              <span className={`text-3xl font-black leading-none ${isDead ? 'text-red-900' : 'text-zinc-100'}`}>{npc.currentHp} <span className="text-zinc-700 text-lg">/ {npc.maxHp}</span></span>
              <div className="flex gap-2">
                <input type="number" value={damageInput} onChange={(e) => setDamageInput(e.target.value)} placeholder="Valor" className="w-16 bg-zinc-900 border border-zinc-800 text-white rounded px-2 text-xs outline-none focus:border-red-500" />
                <select value={selectedDmgType} onChange={(e) => setSelectedDmgType(e.target.value)} className="bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] rounded px-2 py-1 outline-none">
                  {DAMAGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <button onClick={() => applyDamage(true)} className="bg-red-900/40 hover:bg-red-800/60 text-white px-3 py-1 rounded text-[10px] font-black uppercase transition-colors">Dano</button>
                <button onClick={() => onUpdateHp(npc.id, parseInt(damageInput)||0)} className="bg-zinc-800 hover:bg-green-900/40 text-zinc-300 px-3 py-1 rounded text-[10px] font-black uppercase transition-colors">Cura</button>
              </div>
            </div>
            <div className="h-3 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/50"><div className={`h-full transition-all duration-700 ${isDead ? 'bg-zinc-800' : 'bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]'}`} style={{ width: `${hpPercent}%` }}></div></div>
          </section>
        </div>

        {/* Coluna da Direita: Terminal de Resultado das Rolagens */}
        <div className="w-full md:w-64 bg-black border-t md:border-t-0 md:border-l border-zinc-800 p-6 flex flex-col justify-center items-center relative min-h-[200px]">
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[8px] text-zinc-700 font-mono tracking-widest uppercase">Ordo_Dice_Terminal</div>
          
          {rollResult ? (
            <div className="text-center animate-fade-in w-full">
              <p className="text-zinc-500 text-[10px] font-black uppercase mb-1 tracking-tighter italic">{rollResult.label}</p>
              <div className={`text-6xl font-black leading-none mb-4 ${rollResult.isCrit ? 'text-green-500 drop-shadow-[0_0_15px_rgba(34,197,94,0.4)]' : rollResult.isFumble ? 'text-red-600' : 'text-white'}`}>
                {rollResult.total}
              </div>
              <div className="flex flex-wrap justify-center gap-1">
                {rollResult.rolls.map((r, i) => (
                  <span key={i} className={`text-[9px] font-mono px-1 border ${r === 20 ? 'border-green-500 text-green-400' : r === 1 ? 'border-red-600 text-red-500' : 'border-zinc-800 text-zinc-600'}`}>{r}</span>
                ))}
              </div>
              {rollResult.isCrit && <p className="text-green-500 text-[9px] font-black mt-4 uppercase tracking-widest animate-pulse">Crítico!</p>}
              {rollResult.isFumble && <p className="text-red-600 text-[9px] font-black mt-4 uppercase tracking-widest animate-pulse">Desastre!</p>}
            </div>
          ) : (
            <p className="text-zinc-800 text-[10px] font-black uppercase tracking-widest text-center">Aguardando<br/>Rolagem</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// PAINEL PRINCIPAL
// ==========================================
export function NpcPanel() {
  // Reparador Automático de Dados no carregamento do LocalStorage
  const [enemies, setEnemies] = useState(() => {
    const saved = localStorage.getItem('ordo_alvarus_npcs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map(e => ({
            ...e,
            attributes: e.attributes || { agi: 1, for: 1, int: 1, pre: 1, vig: 1 },
            actions: e.actions || [],
            resistances: e.resistances || []
          }));
        }
      } catch (err) {
        console.error("Erro ao carregar NPCs salvos");
      }
    }
    return [];
  });
  
  const [selectedNpcId, setSelectedNpcId] = useState(null);
  
  // Estados Form - Básico
  const [newName, setNewName] = useState('');
  const [newHp, setNewHp] = useState('');
  const [newVd, setNewVd] = useState('');
  const [newAttrs, setNewAttrs] = useState({ agi: 1, for: 1, int: 1, pre: 1, vig: 1 });
  
  // Estados Form - Ações
  const [newActionName, setNewActionName] = useState('');
  const [newActionBonus, setNewActionBonus] = useState('');
  const [newActionAttr, setNewActionAttr] = useState('agi');
  const [actions, setActions] = useState([]);

  // Estados Form - RD
  const [pendingRes, setPendingRes] = useState([]);
  const [tempResType, setTempResType] = useState('Físico');
  const [tempResValue, setTempResValue] = useState('');

  useEffect(() => {
    localStorage.setItem('ordo_alvarus_npcs', JSON.stringify(enemies));
  }, [enemies]);

  const addAction = () => {
    if (!newActionName) return;
    setActions([...actions, { name: newActionName, bonus: parseInt(newActionBonus)||0, attr: newActionAttr }]);
    setNewActionName(''); setNewActionBonus('');
  };

  const addRes = () => {
    const val = parseInt(tempResValue);
    if (!val) return;
    setPendingRes([...pendingRes, { type: tempResType, value: val }]);
    setTempResValue('');
  };

  const handleAddEnemy = (e) => {
    e.preventDefault();
    if (!newName.trim() || !newHp) return;
    const newEnemy = {
      id: Date.now(),
      name: newName,
      maxHp: parseInt(newHp),
      currentHp: parseInt(newHp),
      vd: newVd,
      attributes: { ...newAttrs },
      actions: actions,
      resistances: pendingRes
    };
    setEnemies([...enemies, newEnemy]);
    
    // Limpar formulário após criar
    setNewName(''); setNewHp(''); setNewVd(''); 
    setActions([]); setPendingRes([]);
  };

  const updateHp = (id, amount) => {
    setEnemies(enemies.map(e => e.id === id ? { ...e, currentHp: Math.max(0, Math.min(e.maxHp, e.currentHp + amount)) } : e));
  };

  const selectedNpc = enemies.find(e => e.id === selectedNpcId);

  return (
    <div className="flex flex-col gap-8">
      {/* FORMULÁRIO DE CRIAÇÃO COMPLETO */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 backdrop-blur-md">
        <h3 className="text-xl font-black text-zinc-100 mb-6 border-b border-zinc-800 pb-2 uppercase italic tracking-tighter">Criação de Ameaça</h3>
        <form onSubmit={handleAddEnemy} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nome" className="bg-zinc-950 border border-zinc-700 text-zinc-100 rounded px-4 py-2 outline-none focus:border-red-500" />
            <input type="number" value={newHp} onChange={e => setNewHp(e.target.value)} placeholder="HP Máximo" className="bg-zinc-950 border border-zinc-700 text-zinc-100 rounded px-4 py-2 focus:border-red-500 outline-none" />
            <input type="text" value={newVd} onChange={e => setNewVd(e.target.value)} placeholder="VD" className="bg-zinc-950 border border-zinc-700 text-zinc-100 rounded px-4 py-2 focus:border-red-500 outline-none" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Bloco 1: Atributos */}
            <div className="bg-zinc-950/40 p-4 rounded-xl border border-zinc-800">
              <span className="text-zinc-500 text-[10px] font-black uppercase w-full mb-2 block tracking-widest">Atributos</span>
              <div className="flex justify-between">
                {['agi', 'for', 'int', 'pre', 'vig'].map(a => (
                  <div key={a} className="flex flex-col items-center">
                    <label className="text-[8px] text-zinc-700 uppercase font-bold">{a}</label>
                    <input type="number" value={newAttrs[a]} onChange={e => setNewAttrs({...newAttrs, [a]: parseInt(e.target.value)||0})} className="w-8 bg-zinc-900 border border-zinc-800 text-center text-zinc-100 rounded text-xs py-1 outline-none focus:border-red-500" />
                  </div>
                ))}
              </div>
            </div>

            {/* Bloco 2: Ações */}
            <div className="bg-zinc-950/40 p-4 rounded-xl border border-zinc-800">
               <span className="text-zinc-500 text-[10px] font-black uppercase w-full mb-2 block tracking-widest">Ataques</span>
               <div className="flex gap-2 mb-2">
                  <input type="text" value={newActionName} onChange={e => setNewActionName(e.target.value)} placeholder="Nome" className="flex-1 bg-zinc-900 border border-zinc-800 text-xs text-white px-2 rounded outline-none focus:border-red-500" />
                  <input type="number" value={newActionBonus} onChange={e => setNewActionBonus(e.target.value)} placeholder="+5" className="w-10 bg-zinc-900 border border-zinc-800 text-center text-xs text-white rounded outline-none focus:border-red-500" />
                  <select value={newActionAttr} onChange={e => setNewActionAttr(e.target.value)} className="bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 rounded outline-none focus:border-red-500">
                    {['agi', 'for', 'int', 'pre', 'vig'].map(a => <option key={a} value={a}>{a.toUpperCase()}</option>)}
                  </select>
                  <button type="button" onClick={addAction} className="bg-red-900/30 hover:bg-red-900/60 text-red-500 px-2 rounded font-bold transition-colors">+</button>
               </div>
               <div className="flex flex-wrap gap-1 max-h-12 overflow-y-auto">
                  {actions.map((a, i) => <span key={i} className="text-[8px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400 flex items-center gap-1">{a.name} (+{a.bonus}) <button type="button" onClick={() => setActions(actions.filter((_, idx) => idx !== i))} className="hover:text-red-500">✕</button></span>)}
               </div>
            </div>

            {/* Bloco 3: Resistências */}
            <div className="bg-zinc-950/40 p-4 rounded-xl border border-zinc-800">
               <span className="text-zinc-500 text-[10px] font-black uppercase w-full mb-2 block tracking-widest">Resistências (RD)</span>
               <div className="flex gap-2 mb-2">
                  <select value={tempResType} onChange={e => setTempResType(e.target.value)} className="flex-1 bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] rounded px-1 py-1 outline-none focus:border-blue-500">
                    {DAMAGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <input type="number" value={tempResValue} onChange={e => setTempResValue(e.target.value)} placeholder="Valor" className="w-12 bg-zinc-900 border border-zinc-800 text-center text-zinc-100 rounded text-xs outline-none focus:border-blue-500" />
                  <button type="button" onClick={addRes} className="bg-blue-900/30 hover:bg-blue-900/60 text-blue-400 px-2 rounded font-bold transition-colors">+</button>
               </div>
               <div className="flex flex-wrap gap-1 max-h-12 overflow-y-auto">
                  {pendingRes.map((r, i) => <span key={i} className="text-[8px] bg-blue-950 border border-blue-900 text-blue-300 px-1.5 py-0.5 rounded flex items-center gap-1">RD {r.value} {r.type} <button type="button" onClick={() => setPendingRes(pendingRes.filter((_, idx) => idx !== i))} className="hover:text-red-500">✕</button></span>)}
               </div>
            </div>
          </div>

          <button type="submit" className="w-full py-3 bg-red-900/40 hover:bg-red-800/60 border border-red-700 text-red-100 font-black rounded-lg uppercase text-xs tracking-widest transition-colors shadow-md">INVOCAR AMEAÇA NO TABULEIRO</button>
        </form>
      </div>

      {/* GRID DE CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {enemies.map(enemy => {
          const isDead = enemy.currentHp <= 0;
          return (
            <div 
              key={enemy.id} 
              onClick={() => setSelectedNpcId(enemy.id)}
              className={`relative bg-zinc-900/80 border rounded-xl cursor-pointer p-4 transition-all shadow-lg overflow-hidden ${isDead ? 'border-red-900/50 grayscale opacity-50' : 'border-zinc-800 hover:border-red-500/50 hover:-translate-y-1'}`}
            >
              {isDead && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-red-950/20 backdrop-blur-[1px] animate-pulse">
                  <span className="border-4 border-red-600 text-red-600 font-black text-xl px-4 py-1 rotate-[-12deg] uppercase tracking-tighter">Eliminado</span>
                </div>
              )}
              
              <div className="flex justify-between items-start mb-4">
                <h4 className={`font-black uppercase truncate pr-2 ${isDead ? 'text-red-900 line-through' : 'text-zinc-100'}`}>{enemy.name}</h4>
                <button onClick={(e) => { e.stopPropagation(); setEnemies(enemies.filter(x => x.id !== enemy.id)); }} className="text-zinc-700 hover:text-red-500 text-xs z-20 relative">✕</button>
              </div>
              <div className="h-1 w-full bg-zinc-950 rounded-full overflow-hidden mb-2">
                <div className={`h-full transition-all duration-1000 ${isDead ? 'bg-zinc-800' : 'bg-red-600'}`} style={{ width: `${(enemy.currentHp/enemy.maxHp)*100}%` }}></div>
              </div>
              <div className="flex justify-between text-[9px] font-bold text-zinc-500 uppercase">
                <span>HP {enemy.currentHp}</span>
                <span>VD {enemy.vd || '??'}</span>
              </div>
            </div>
          );
        })}
        {enemies.length === 0 && <div className="col-span-full text-center p-8 border-2 border-dashed border-zinc-800 rounded-xl text-zinc-600 uppercase font-black tracking-widest">Nenhuma Ameaça Detectada</div>}
      </div>

      <NpcDetailsModal npc={selectedNpc} onClose={() => setSelectedNpcId(null)} onUpdateHp={updateHp} />
    </div>
  );
}