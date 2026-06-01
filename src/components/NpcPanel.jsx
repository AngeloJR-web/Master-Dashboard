import { useState, useEffect } from 'react';

export function NpcPanel() {
  // ==========================================
  // ESTADOS DO BANCO DE DADOS E FORMULÁRIO
  // ==========================================
  const [npcs, setNpcs] = useState(() => {
    const saved = localStorage.getItem('ordo_npcs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [];
  });

  // Campos Básicos
  const [name, setName] = useState('');
  const [maxHp, setMaxHp] = useState('');
  const [vd, setVd] = useState('');

  // Atributos
  const [attributes, setAttributes] = useState({ agi: 1, for: 1, int: 1, pre: 1, vig: 1 });

  // Ataques
  const [attacks, setAttacks] = useState([]);
  const [newAttackName, setNewAttackName] = useState('');
  const [newAttackBonus, setNewAttackBonus] = useState('');
  const [newAttackAttr, setNewAttackAttr] = useState('AGI');

  // Resistências
  const [resistances, setResistances] = useState([]);
  const [newResType, setNewResType] = useState('Físico');
  const [newResValue, setNewResValue] = useState('');

  // Habilidades Especiais (NOVO)
  const [abilities, setAbilities] = useState([]);
  const [newAbilityName, setNewAbilityName] = useState('');
  const [newAbilityDesc, setNewAbilityDesc] = useState('');

  // Salvar no LocalStorage sempre que 'npcs' mudar
  useEffect(() => {
    localStorage.setItem('ordo_npcs', JSON.stringify(npcs));
  }, [npcs]);

  // ==========================================
  // FUNÇÕES DE ADIÇÃO (LISTAS TEMPORÁRIAS)
  // ==========================================
  const handleAddAttack = () => {
    if (!newAttackName || !newAttackBonus) return;
    setAttacks([...attacks, { id: Date.now(), name: newAttackName, bonus: newAttackBonus, attr: newAttackAttr }]);
    setNewAttackName(''); setNewAttackBonus('');
  };

  const handleAddResistance = () => {
    if (!newResValue) return;
    setResistances([...resistances, { id: Date.now(), type: newResType, value: newResValue }]);
    setNewResValue('');
  };

  const handleAddAbility = () => {
    if (!newAbilityName || !newAbilityDesc) return;
    setAbilities([...abilities, { id: Date.now(), name: newAbilityName, description: newAbilityDesc }]);
    setNewAbilityName(''); setNewAbilityDesc('');
  };

  const handleRemoveItem = (setter, list, id) => {
    setter(list.filter(item => item.id !== id));
  };

  const handleAttributeChange = (attr, value) => {
    setAttributes({ ...attributes, [attr]: parseInt(value) || 0 });
  };

  // ==========================================
  // FUNÇÃO DE CRIAÇÃO DA AMEAÇA
  // ==========================================
  const handleCreateNpc = (e) => {
    e.preventDefault();
    if (!name.trim() || !maxHp) return alert("Nome e HP Máximo são obrigatórios.");

    const newNpc = {
      id: Date.now().toString(),
      name,
      maxHp: parseInt(maxHp),
      currentHp: parseInt(maxHp),
      vd: vd || '?',
      attributes,
      attacks,
      resistances,
      abilities // Salvando as habilidades na ficha da ameaça
    };

    setNpcs([newNpc, ...npcs]);

    // Limpar formulário
    setName(''); setMaxHp(''); setVd('');
    setAttributes({ agi: 1, for: 1, int: 1, pre: 1, vig: 1 });
    setAttacks([]); setResistances([]); setAbilities([]);
  };

  // ==========================================
  // FUNÇÕES DE CONTROLE NO TABULEIRO
  // ==========================================
  const handleDeleteNpc = (idToRemove) => {
    if (window.confirm("Remover esta ameaça do painel?")) {
      setNpcs(npcs.filter(n => n.id !== idToRemove));
    }
  };

  const updateNpcHp = (id, newHp) => {
    setNpcs(npcs.map(n => n.id === id ? { ...n, currentHp: newHp } : n));
  };

  // ==========================================
  // RENDERIZAÇÃO
  // ==========================================
  return (
    <div className="max-w-7xl mx-auto pb-20 animate-fade-in">
      
      {/* PAINEL DE CRIAÇÃO */}
      <section className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-6 shadow-2xl mb-8 backdrop-blur-sm">
        <h2 className="text-xl font-black text-white uppercase tracking-widest italic mb-6">Criação de Ameaça</h2>
        
        <form onSubmit={handleCreateNpc} className="space-y-6">
          
          {/* LINHA 1: NOME, HP, VD */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Nome</p>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded text-zinc-100 font-bold outline-none focus:border-red-500 transition-colors" placeholder="Ex: Zumbi de Sangue" />
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">HP Máximo</p>
              <input type="number" value={maxHp} onChange={e => setMaxHp(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded text-zinc-100 font-bold outline-none focus:border-red-500 transition-colors" placeholder="Ex: 100" />
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">VD</p>
              <input type="text" value={vd} onChange={e => setVd(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded text-zinc-100 font-bold outline-none focus:border-red-500 transition-colors" placeholder="Ex: 20" />
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* COLUNA 1: ATRIBUTOS */}
            <div className="bg-zinc-900/40 p-4 rounded-lg border border-zinc-800/50">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Atributos</p>
              <div className="flex justify-between gap-2">
                {Object.entries(attributes).map(([attr, val]) => (
                  <div key={attr} className="flex flex-col items-center">
                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">{attr}</p>
                    <input type="number" value={val} onChange={e => handleAttributeChange(attr, e.target.value)} className="w-12 bg-zinc-950 border border-zinc-700 rounded p-2 text-center text-zinc-200 font-black outline-none focus:border-red-500" />
                  </div>
                ))}
              </div>
            </div>

            {/* COLUNA 2: ATAQUES */}
            <div className="bg-zinc-900/40 p-4 rounded-lg border border-zinc-800/50">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Ataques</p>
              <div className="flex gap-2 mb-3">
                <input type="text" value={newAttackName} onChange={e => setNewAttackName(e.target.value)} placeholder="Nome" className="flex-1 bg-zinc-950 border border-zinc-700 rounded px-2 text-xs text-white" />
                <input type="text" value={newAttackBonus} onChange={e => setNewAttackBonus(e.target.value)} placeholder="+5" className="w-12 bg-zinc-950 border border-zinc-700 rounded px-2 text-xs text-center text-white" />
                <select value={newAttackAttr} onChange={e => setNewAttackAttr(e.target.value)} className="w-16 bg-zinc-950 border border-zinc-700 rounded px-1 text-xs text-zinc-300">
                  <option value="AGI">AGI</option><option value="FOR">FOR</option><option value="INT">INT</option><option value="PRE">PRE</option><option value="VIG">VIG</option>
                </select>
                <button type="button" onClick={handleAddAttack} className="bg-red-900 hover:bg-red-800 text-white w-8 rounded font-black">+</button>
              </div>
              <div className="space-y-1 max-h-20 overflow-y-auto pr-1">
                {attacks.map(atk => (
                  <div key={atk.id} className="flex justify-between items-center bg-zinc-950 p-2 rounded text-xs border border-zinc-800">
                    <span className="text-zinc-300 font-bold">{atk.name} <span className="text-red-400">({atk.bonus})</span> [{atk.attr}]</span>
                    <button type="button" onClick={() => handleRemoveItem(setAttacks, attacks, atk.id)} className="text-zinc-600 hover:text-red-500">✕</button>
                  </div>
                ))}
              </div>
            </div>

            {/* COLUNA 3: RESISTÊNCIAS */}
            <div className="bg-zinc-900/40 p-4 rounded-lg border border-zinc-800/50">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Resistências (RD)</p>
              <div className="flex gap-2 mb-3">
                <select value={newResType} onChange={e => setNewResType(e.target.value)} className="flex-1 bg-zinc-950 border border-zinc-700 rounded px-2 text-xs text-zinc-300">
                  <option>Físico</option><option>Balístico</option><option>Sangue</option><option>Morte</option><option>Conhecimento</option><option>Energia</option><option>Paranormal</option>
                </select>
                <input type="text" value={newResValue} onChange={e => setNewResValue(e.target.value)} placeholder="Valor" className="w-16 bg-zinc-950 border border-zinc-700 rounded px-2 text-xs text-center text-white" />
                <button type="button" onClick={handleAddResistance} className="bg-blue-900 hover:bg-blue-800 text-white w-8 rounded font-black">+</button>
              </div>
              <div className="space-y-1 max-h-20 overflow-y-auto pr-1">
                {resistances.map(res => (
                  <div key={res.id} className="flex justify-between items-center bg-zinc-950 p-2 rounded text-xs border border-zinc-800">
                    <span className="text-zinc-300 font-bold">{res.type}: <span className="text-blue-400">{res.value}</span></span>
                    <button type="button" onClick={() => handleRemoveItem(setResistances, resistances, res.id)} className="text-zinc-600 hover:text-red-500">✕</button>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* NOVA SESSÃO FULL-WIDTH: HABILIDADES */}
          <div className="bg-zinc-900/40 p-4 rounded-lg border border-zinc-800/50 flex flex-col gap-3">
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Habilidades e Passivas</p>
            <div className="flex flex-col md:flex-row gap-2 items-stretch">
              <input 
                type="text" 
                value={newAbilityName} 
                onChange={e => setNewAbilityName(e.target.value)} 
                placeholder="Nome da Habilidade (Ex: Enigma do Medo)" 
                className="w-full md:w-1/4 bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-xs text-white outline-none focus:border-red-500" 
              />
              <textarea 
                value={newAbilityDesc} 
                onChange={e => setNewAbilityDesc(e.target.value)} 
                placeholder="Descrição (Ex: A criatura é imune a dano até que a fonte do medo seja destruída...)" 
                className="flex-1 bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-xs text-white outline-none focus:border-red-500 resize-none h-10"
              />
              <button type="button" onClick={handleAddAbility} className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 rounded font-black text-xs uppercase tracking-widest transition-colors">Add</button>
            </div>
            
            {/* Lista de Habilidades Cadastradas no Form */}
            {abilities.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                {abilities.map(ab => (
                  <div key={ab.id} className="flex justify-between items-start bg-zinc-950 p-3 rounded text-xs border border-zinc-800 group">
                    <div>
                      <span className="text-red-400 font-black uppercase tracking-widest text-[10px] block mb-1">{ab.name}</span>
                      <span className="text-zinc-400 font-medium leading-relaxed">{ab.description}</span>
                    </div>
                    <button type="button" onClick={() => handleRemoveItem(setAbilities, abilities, ab.id)} className="text-zinc-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity ml-2 px-1">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" className="w-full bg-red-900 hover:bg-red-700 text-white font-black uppercase tracking-widest py-4 rounded-lg transition-colors shadow-lg">
            Invocar Ameaça no Tabuleiro
          </button>
        </form>
      </section>

      {/* LISTAGEM DE AMEAÇAS INVOCADAS */}
      <div className="space-y-4">
        {npcs.length === 0 ? (
          <div className="border border-dashed border-zinc-800 rounded-xl p-10 flex items-center justify-center">
            <h3 className="text-zinc-600 font-black uppercase tracking-widest">Nenhuma Ameaça Detectada</h3>
          </div>
        ) : (
          npcs.map(npc => (
            <div key={npc.id} className="bg-zinc-950/80 border border-red-900/30 rounded-xl p-4 md:p-6 shadow-lg flex flex-col gap-4">
              
              {/* CABEÇALHO DO NPC */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/50 pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded bg-black border border-zinc-800 flex items-center justify-center text-red-500 font-black text-2xl">
                    <i className="fa-solid fa-skull"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-zinc-100 uppercase tracking-widest leading-none">{npc.name}</h3>
                    <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest mt-1">VD {npc.vd}</p>
                  </div>
                </div>

                {/* CONTROLE DE HP RÁPIDO */}
                <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-lg">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">HP</p>
                  <button onClick={() => updateNpcHp(npc.id, Math.max(0, npc.currentHp - 5))} className="text-zinc-500 hover:text-red-500 px-2 font-bold">-5</button>
                  <button onClick={() => updateNpcHp(npc.id, Math.max(0, npc.currentHp - 1))} className="text-zinc-500 hover:text-red-500 px-2 font-bold">-1</button>
                  
                  <input type="number" value={npc.currentHp} onChange={e => updateNpcHp(npc.id, parseInt(e.target.value) || 0)} className="w-16 bg-transparent text-center font-black text-xl text-white outline-none" />
                  <span className="text-zinc-600 font-black">/ {npc.maxHp}</span>
                  
                  <button onClick={() => updateNpcHp(npc.id, Math.min(npc.maxHp, npc.currentHp + 1))} className="text-zinc-500 hover:text-green-500 px-2 font-bold">+1</button>
                  <button onClick={() => updateNpcHp(npc.id, Math.min(npc.maxHp, npc.currentHp + 5))} className="text-zinc-500 hover:text-green-500 px-2 font-bold">+5</button>
                </div>
              </div>

              {/* DADOS TÁTICOS DO NPC */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                
                {/* ATRIBUTOS */}
                <div className="flex gap-2 justify-between">
                  {Object.entries(npc.attributes).map(([attr, val]) => (
                    <div key={attr} className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-zinc-900 border border-zinc-700 rounded flex items-center justify-center font-black text-white text-xs mb-1">{val}</div>
                      <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">{attr}</span>
                    </div>
                  ))}
                </div>

                {/* ATAQUES */}
                <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 border-b border-zinc-800 pb-1">Ataques</p>
                  <div className="flex flex-col gap-1">
                    {npc.attacks.length === 0 ? <span className="text-xs text-zinc-600 italic">Nenhum</span> : 
                      npc.attacks.map(atk => (
                        <div key={atk.id} className="text-xs bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
                          <span className="font-bold text-zinc-300">{atk.name}</span> <span className="text-red-400 font-bold">{atk.bonus}</span> <span className="text-zinc-500 text-[10px]">[{atk.attr}]</span>
                        </div>
                      ))
                    }
                  </div>
                </div>

                {/* RESISTÊNCIAS */}
                <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 border-b border-zinc-800 pb-1">Resistências</p>
                  <div className="flex flex-wrap gap-1">
                    {npc.resistances.length === 0 ? <span className="text-xs text-zinc-600 italic">Nenhuma</span> : 
                      npc.resistances.map(res => (
                        <span key={res.id} className="text-[10px] font-bold bg-blue-900/20 border border-blue-900/50 text-blue-400 px-2 py-1 rounded">
                          {res.type} {res.value}
                        </span>
                      ))
                    }
                  </div>
                </div>
                
                {/* BOTÃO DE DELETAR */}
                <div className="flex justify-end items-end">
                   <button onClick={() => handleDeleteNpc(npc.id)} className="text-[10px] font-black text-red-500 border border-red-900/50 hover:bg-red-900/30 px-4 py-2 rounded transition-colors uppercase tracking-widest">
                     <i className="fa-solid fa-trash mr-2"></i> Eliminar
                   </button>
                </div>

              </div>

              {/* RENDERIZAÇÃO DAS HABILIDADES NO CARD */}
              {npc.abilities && npc.abilities.length > 0 && (
                <div className="mt-2 pt-4 border-t border-zinc-800/50">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">Habilidades Especiais</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {npc.abilities.map(ab => (
                      <div key={ab.id} className="bg-zinc-900/50 p-3 rounded border border-zinc-800">
                        <span className="text-red-400 font-black uppercase tracking-widest text-[10px] block mb-1">{ab.name}</span>
                        <span className="text-zinc-300 font-medium text-xs leading-relaxed">{ab.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ))
        )}
      </div>

    </div>
  );
}