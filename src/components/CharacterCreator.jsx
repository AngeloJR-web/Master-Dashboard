import { useState } from 'react';

const CLASSES = {
  Combatente: { pvBase: 20, pvNv: 4, peBase: 2, peNv: 2, sanBase: 12, sanNv: 3 },
  Especialista: { pvBase: 16, pvNv: 3, peBase: 3, peNv: 3, sanBase: 16, sanNv: 4 },
  Ocultista: { pvBase: 12, pvNv: 2, peBase: 4, peNv: 4, sanBase: 20, sanNv: 5 }
};

const OFFICIAL_SKILLS = [
  "Acrobacia", "Adestramento", "Artes", "Atletismo", "Atualidades", 
  "Ciências", "Crime", "Diplomacia", "Enganação", "Fortitude", 
  "Furtividade", "Iniciativa", "Intimidação", "Intuição", "Investigação", 
  "Luta", "Medicina", "Ocultismo", "Percepção", "Pilotagem", 
  "Pontaria", "Profissão", "Reflexos", "Religião", "Sobrevivência", 
  "Tática", "Tecnologia", "Vontade"
];

export function CharacterCreator({ onClose, onSave }) {
  const [step, setStep] = useState(1);
  
  const [name, setName] = useState('');
  const [role, setRole] = useState('Especialista');
  const [nex, setNex] = useState(5);
  const [avatarUrl, setAvatarUrl] = useState('');
  
  const [attrs, setAttrs] = useState({ agi: 1, for: 1, int: 1, pre: 1, vig: 1 });
  const [skills, setSkills] = useState({});
  
  const totalPointsSpent = Object.values(attrs).reduce((acc, val) => acc + val, 0) - 5;
  const pointsRemaining = 4 - totalPointsSpent;

  const handleAttrChange = (attr, increment) => {
    setAttrs(prev => {
      const current = prev[attr];
      const newValue = current + increment;
      if (newValue < 0 || newValue > 3) return prev; 
      if (increment > 0 && pointsRemaining <= 0) return prev;
      return { ...prev, [attr]: newValue };
    });
  };

  const toggleSkill = (skill) => {
    setSkills(prev => {
      const current = prev[skill] || 0;
      let next = 0;
      if (current === 0) next = 5;
      else if (current === 5) next = 10;
      else if (current === 10) next = 15;
      else next = 0;
      return { ...prev, [skill]: next };
    });
  };

  const calculateStatus = () => {
    const classData = CLASSES[role];
    const level = Math.floor(nex / 5) - 1; 
    const effectiveLevel = Math.max(0, level);

    const maxHp = classData.pvBase + attrs.vig + (classData.pvNv + attrs.vig) * effectiveLevel;
    const maxPe = classData.peBase + attrs.pre + (classData.peNv + attrs.pre) * effectiveLevel;
    const maxSanity = classData.sanBase + (classData.sanNv * effectiveLevel);

    return { maxHp, maxPe, maxSanity };
  };

  const status = calculateStatus();

  // Função para lidar com o Upload de Imagem
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("A imagem é muito pesada (maior que 2MB). Escolha um arquivo menor para evitar travamentos no salvamento.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result); // Salva o Base64 gerado pela imagem
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFinish = () => {
    if (!name.trim()) return;
    
    const newPlayer = {
      id: Date.now(),
      name,
      role,
      nex,
      avatarUrl,
      hp: status.maxHp, maxHp: status.maxHp,
      sanity: status.maxSanity, maxSanity: status.maxSanity,
      pe: status.maxPe, maxPe: status.maxPe,
      defense: 10 + attrs.agi,
      dodge: 10 + attrs.agi,
      block: 0,
      attributes: { ...attrs },
      inventory: [],
      abilities: [],
      skills: { ...skills }
    };

    onSave(newPlayer);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-fade-in flex flex-col h-[700px]">
        
        <header className="p-6 border-b border-zinc-800 bg-gradient-to-r from-zinc-900 to-red-950/20 flex justify-between items-center z-10">
          <div>
            <h2 className="text-2xl font-black text-zinc-100 tracking-tighter uppercase">Protocolo: Agente Zero</h2>
            <div className="flex gap-2 mt-2">
              <div className={`h-1.5 w-12 rounded-full ${step >= 1 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-zinc-800'}`}></div>
              <div className={`h-1.5 w-12 rounded-full ${step >= 2 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-zinc-800'}`}></div>
              <div className={`h-1.5 w-12 rounded-full ${step >= 3 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-zinc-800'}`}></div>
              <div className={`h-1.5 w-12 rounded-full ${step >= 4 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-zinc-800'}`}></div>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 flex items-center justify-center font-bold transition-colors">✕</button>
        </header>

        <div className="flex-1 overflow-y-auto p-8 relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 to-zinc-950">
          
          {step === 1 && (
            <div className="space-y-6 animate-fade-in max-w-md mx-auto mt-2">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-zinc-900 border-2 border-dashed border-zinc-700 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden text-zinc-600 text-3xl font-black uppercase transition-all shadow-inner">
                  {avatarUrl ? <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" /> : (name ? name.charAt(0) : '?')}
                </div>
                <h3 className="text-xl font-bold text-zinc-100">Identidade do Investigador</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest block mb-1">Foto do Personagem</label>
                  <div className="flex items-center gap-3">
                    <input type="text" value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} placeholder="Cole o link (URL) aqui..." className="flex-1 bg-zinc-950 border border-zinc-800 text-zinc-400 text-xs px-4 py-2 rounded-lg outline-none focus:border-red-500 transition-colors" />
                    <span className="text-[10px] text-zinc-600 font-black uppercase">OU</span>
                    {/* Botão de Upload Nativo */}
                    <label className="cursor-pointer bg-zinc-800 hover:bg-red-900/40 border border-zinc-700 hover:border-red-700 text-zinc-300 hover:text-red-100 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-colors flex items-center justify-center whitespace-nowrap">
                      Arquivo do PC
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest block mb-1">Nome Completo</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Arthur Cervero" className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 px-4 py-3 rounded-lg outline-none focus:border-red-500 transition-colors" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest block mb-1">Classe</label>
                    <select value={role} onChange={e => setRole(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 px-4 py-3 rounded-lg outline-none focus:border-red-500">
                      <option value="Combatente">Combatente</option>
                      <option value="Especialista">Especialista</option>
                      <option value="Ocultista">Ocultista</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest block mb-1">NEX (%)</label>
                    <input type="number" value={nex} onChange={e => setNex(parseInt(e.target.value)||0)} step="5" min="5" max="99" className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 px-4 py-3 rounded-lg outline-none focus:border-red-500 text-center font-bold" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
             <div className="space-y-8 animate-fade-in">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-zinc-100">Matriz de Atributos</h3>
                <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">Distribua seus pontos iniciais</p>
                <div className={`mt-4 inline-block px-4 py-1 rounded-full text-sm font-black border transition-colors ${pointsRemaining === 0 ? 'bg-green-900/20 text-green-500 border-green-900/50 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'bg-red-900/20 text-red-500 border-red-900/50'}`}>
                  {pointsRemaining} PONTOS RESTANTES
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-6 mt-10">
                {['agi', 'for', 'int', 'pre', 'vig'].map(attr => (
                  <div key={attr} className="flex flex-col items-center">
                    <span className="text-[10px] text-zinc-500 font-black uppercase mb-3 tracking-widest">{attr}</span>
                    <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden shadow-lg">
                      <button onClick={() => handleAttrChange(attr, -1)} className="w-10 h-14 bg-zinc-950 hover:bg-zinc-800 text-zinc-400 font-bold transition-colors">-</button>
                      <div className="w-14 h-14 flex items-center justify-center border-x border-zinc-800">
                        <span className={`text-2xl font-black ${attrs[attr] > 1 ? 'text-red-500' : 'text-zinc-100'}`}>{attrs[attr]}</span>
                      </div>
                      <button onClick={() => handleAttrChange(attr, 1)} className="w-10 h-14 bg-zinc-950 hover:bg-zinc-800 text-zinc-400 font-bold transition-colors">+</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
             <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-zinc-100">Treinamento de Perícias</h3>
                <div className="mt-4 inline-block px-4 py-1 rounded-full text-sm font-black border bg-zinc-900/50 border-zinc-700 text-zinc-300">
                  {Object.values(skills).filter(val => val > 0).length} PERÍCIAS TREINADAS
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {OFFICIAL_SKILLS.map(skill => {
                  const bonus = skills[skill] || 0;
                  let btnClass = "bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:border-zinc-600";
                  let labelClass = "";
                  if (bonus === 5) { btnClass = "bg-red-900/20 border-red-900/50 text-red-300 shadow-inner"; labelClass = "Treinado"; }
                  else if (bonus === 10) { btnClass = "bg-red-900/40 border-red-700 text-red-100"; labelClass = "Veterano"; }
                  else if (bonus === 15) { btnClass = "bg-red-600 border-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]"; labelClass = "Expert"; }
                  return (
                    <div key={skill} onClick={() => toggleSkill(skill)} className={`relative cursor-pointer border p-3 rounded-xl transition-all flex flex-col items-center justify-center gap-1 group select-none ${btnClass}`}>
                      <span className="font-mono text-sm tracking-wide text-center">{skill}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold opacity-50 uppercase tracking-widest">{labelClass || "Destreinado"}</span>
                        <span className="font-black text-lg">+{bonus}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8 animate-fade-in">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-zinc-100">Protocolo Concluído</h3>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 max-w-lg mx-auto shadow-inner">
                <div className="flex justify-between items-center mb-6 pb-6 border-b border-zinc-800">
                  <div className="flex items-center gap-4">
                     <div className="w-16 h-16 bg-zinc-900 rounded-full overflow-hidden border border-zinc-700 flex items-center justify-center text-xl font-black text-zinc-600">
                        {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover"/> : name.charAt(0)}
                     </div>
                    <div>
                      <h4 className="text-2xl font-black text-white uppercase">{name}</h4>
                      <p className="text-red-500 text-sm font-bold tracking-widest uppercase">{role} | NEX {nex}%</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg shadow-lg">
                    <span className="block text-red-600 text-[10px] font-black uppercase tracking-widest mb-1">Vida (PV)</span>
                    <span className="text-3xl font-black text-white">{status.maxHp}</span>
                  </div>
                  <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg shadow-lg">
                    <span className="block text-blue-600 text-[10px] font-black uppercase tracking-widest mb-1">Sanidade</span>
                    <span className="text-3xl font-black text-white">{status.maxSanity}</span>
                  </div>
                  <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg shadow-lg">
                    <span className="block text-yellow-500 text-[10px] font-black uppercase tracking-widest mb-1">Esforço (PE)</span>
                    <span className="text-3xl font-black text-white">{status.maxPe}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        <footer className="p-6 border-t border-zinc-800 bg-zinc-900/50 flex justify-between z-10">
          {step > 1 ? <button onClick={() => setStep(step - 1)} className="px-6 py-3 rounded-lg font-bold text-xs tracking-widest bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors uppercase shadow-md">Voltar</button> : <div></div>}
          {step < 4 ? <button onClick={() => setStep(step + 1)} disabled={step === 1 && !name.trim()} className="px-6 py-3 rounded-lg font-bold text-xs tracking-widest bg-red-900/40 hover:bg-red-800/60 border border-red-700 text-red-100 transition-colors uppercase shadow-md disabled:opacity-30">Próxima Etapa</button> : <button onClick={handleFinish} className="px-8 py-3 rounded-lg font-black text-xs tracking-[0.2em] bg-green-900/40 hover:bg-green-800/60 border border-green-700 text-green-400 transition-colors uppercase shadow-[0_0_15px_rgba(34,197,94,0.2)]">CADASTRAR AGENTE</button>}
        </footer>

      </div>
    </div>
  );
}