import { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF, Center } from '@react-three/drei';

const OFFICIAL_SKILLS = [
  "Acrobacia", "Adestramento", "Artes", "Atletismo", "Atualidades", 
  "Ciências", "Crime", "Diplomacia", "Enganação", "Fortitude", 
  "Furtividade", "Iniciativa", "Intimidação", "Intuição", "Investigação", 
  "Luta", "Medicina", "Ocultismo", "Percepção", "Pilotagem", 
  "Pontaria", "Profissão", "Reflexos", "Religião", "Sobrevivência", 
  "Tática", "Tecnologia", "Vontade"
];

function CharacterModel({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

export function CharacterSheet({ player, onClose, onSave, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('status');

  useEffect(() => {
    if (player) {
      const baseData = JSON.parse(JSON.stringify(player));
      if (!baseData.skills) {
        baseData.skills = {};
        OFFICIAL_SKILLS.forEach(s => { baseData.skills[s] = 0; });
      }
      
      baseData.defense = baseData.defense !== undefined ? baseData.defense : 10;
      baseData.dodge = baseData.dodge !== undefined ? baseData.dodge : 10;
      baseData.block = baseData.block !== undefined ? baseData.block : 0;
      baseData.avatarUrl = baseData.avatarUrl || '';
      baseData.model3d = baseData.model3d || null;
      
      setFormData(baseData);
      setIsEditing(false);
      setActiveSubTab('status');
    }
  }, [player]);

  if (!player || !formData) return null;

  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  const handleAttrChange = (attr, value) => setFormData(prev => ({ ...prev, attributes: { ...prev.attributes, [attr]: parseInt(value) || 0 } }));
  const handleSkillChange = (skill, value) => setFormData(prev => ({ ...prev, skills: { ...prev.skills, [skill]: parseInt(value) || 0 } }));

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Imagem muito pesada (máximo 2MB).");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => handleChange('avatarUrl', reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleModelUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      handleChange('model3d', url);
    }
  };

  const addItem = () => setFormData(p => ({ ...p, inventory: [...p.inventory, { name: '', weight: 1 }] }));
  const updateItem = (index, field, value) => {
    const newInv = [...formData.inventory];
    newInv[index][field] = value;
    setFormData(p => ({ ...p, inventory: newInv }));
  };
  const removeItem = (index) => setFormData(p => ({ ...p, inventory: p.inventory.filter((_, i) => i !== index) }));

  const addAbility = () => setFormData(p => ({ ...p, abilities: [...p.abilities, { name: '', description: '' }] }));
  const updateAbility = (index, field, value) => {
    const newAb = [...formData.abilities];
    newAb[index][field] = value;
    setFormData(p => ({ ...p, abilities: newAb }));
  };
  const removeAbility = (index) => setFormData(p => ({ ...p, abilities: p.abilities.filter((_, i) => i !== index) }));

  const handleSave = () => {
    onSave(formData);
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-10">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose}></div>

      <div className="relative w-full max-w-7xl h-[90vh] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col lg:flex-row animate-fade-in ring-1 ring-white/10">
        
        {/* LADO ESQUERDO: PALCO 3D */}
        <div className="w-full lg:w-[400px] xl:w-[450px] bg-black border-b lg:border-b-0 lg:border-r border-zinc-800 relative flex flex-col shrink-0">
          <div className="absolute top-4 left-4 z-10">
            <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase border border-zinc-800 bg-black/50 px-2 py-1 rounded backdrop-blur-sm">Visão Tática 3D</span>
          </div>

          <div className="flex-1 relative w-full h-[300px] lg:h-auto bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900 to-black cursor-move">
            {formData.model3d ? (
              <Canvas shadows camera={{ position: [0, 0, 4], fov: 50 }}>
                <Suspense fallback={null}>
                  <Stage environment="city" intensity={0.5} adjustCamera={1.5}>
                    <Center>
                      <CharacterModel url={formData.model3d} />
                    </Center>
                  </Stage>
                </Suspense>
                <OrbitControls makeDefault autoRotate autoRotateSpeed={1.5} minPolarAngle={Math.PI / 4} maxPolarAngle={Math.PI / 1.5} />
              </Canvas>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-700 p-8 text-center">
                <i className="fa-solid fa-cube text-4xl mb-4 opacity-30"></i>
                <p className="text-sm font-bold uppercase tracking-widest mb-2">Miniatura Expirada</p>
                <p className="text-[10px] opacity-50 uppercase leading-relaxed text-center">Importe o arquivo .GLB novamente <br/> para visualizar o modelo.</p>
              </div>
            )}
          </div>

          {isEditing && (
            <div className="p-4 bg-zinc-950 border-t border-zinc-800 z-10 flex flex-col gap-2">
              <label className="cursor-pointer w-full bg-red-900/20 hover:bg-red-900/40 border border-red-900/50 text-red-400 text-[10px] uppercase font-bold tracking-widest px-4 py-3 rounded-lg transition-colors flex items-center justify-center text-center">
                <span className="truncate">Importar Modelo (.GLB)</span>
                <input type="file" accept=".glb,.gltf" onChange={handleModelUpload} className="hidden" />
              </label>
              {formData.model3d && <button onClick={() => handleChange('model3d', null)} className="text-xs text-zinc-500 hover:text-red-500 font-bold uppercase py-1 transition-colors">Remover Modelo</button>}
            </div>
          )}
        </div>

        {/* LADO DIREITO: FICHA TÉCNICA */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="relative p-6 lg:p-8 border-b border-zinc-800 bg-gradient-to-r from-zinc-900 via-red-950/20 to-zinc-900 flex justify-between items-start flex-wrap gap-4 shrink-0">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-50"></div>
            
            <div className="flex items-center gap-6 z-10">
              <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-lg bg-zinc-950 border-2 border-red-900/50 flex items-center justify-center text-red-500 font-black text-3xl shadow-[0_0_15px_rgba(220,38,38,0.2)] transform rotate-3 overflow-hidden shrink-0">
                 {formData.avatarUrl ? (
                   <img src={formData.avatarUrl} alt={formData.name} className="w-full h-full object-cover transform -rotate-3 scale-110" />
                 ) : (
                   <span className="transform -rotate-3">{formData.name.charAt(0)}</span>
                 )}
              </div>

              <div>
                {isEditing ? (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2 items-center">
                      <input type="text" value={formData.name} onChange={e => handleChange('name', e.target.value)} className="bg-zinc-900 border border-zinc-700 text-xl font-black text-zinc-100 px-3 py-1 rounded w-48 focus:border-red-500 outline-none" />
                      <label className="cursor-pointer bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] uppercase font-bold px-3 py-2 rounded transition-colors border border-zinc-700 whitespace-nowrap">
                        Mudar Foto
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <input type="text" value={formData.role} onChange={e => handleChange('role', e.target.value)} className="bg-zinc-900 border border-zinc-700 text-red-400 text-sm font-bold uppercase tracking-widest px-3 py-1 rounded w-28 focus:border-red-500 outline-none" />
                      <input type="number" value={formData.maxHp} onChange={e => handleChange('maxHp', parseInt(e.target.value)||0)} className="bg-zinc-900 border border-zinc-700 text-red-500 text-sm font-bold px-2 py-1 rounded w-16 text-center" title="HP Máximo"/>
                      <input type="number" value={formData.maxSanity} onChange={e => handleChange('maxSanity', parseInt(e.target.value)||0)} className="bg-zinc-900 border border-zinc-700 text-blue-500 text-sm font-bold px-2 py-1 rounded w-16 text-center" title="Sanidade Máxima"/>
                      <input type="number" value={formData.maxPe} onChange={e => handleChange('maxPe', parseInt(e.target.value)||0)} className="bg-zinc-900 border border-zinc-700 text-yellow-500 text-sm font-bold px-2 py-1 rounded w-16 text-center" title="PE Máximo"/>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-4xl lg:text-5xl font-black text-zinc-100 tracking-tighter">{formData.name}</h2>
                    <p className="text-red-500 font-bold text-sm uppercase tracking-[0.3em] mt-1">{formData.role}</p>
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-2 lg:gap-3 z-10 items-center w-full lg:w-auto justify-end mt-2 lg:mt-0">
              {isEditing ? (
                <>
                  <button onClick={() => onDelete(formData.id)} className="px-3 lg:px-4 py-2 rounded font-bold text-[10px] lg:text-xs tracking-widest bg-red-950 border border-red-900 text-red-500 hover:bg-red-900 hover:text-red-100 transition-colors">EXCLUIR</button>
                  <button onClick={() => setIsEditing(false)} className="px-3 lg:px-4 py-2 rounded font-bold text-[10px] lg:text-xs tracking-widest bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors">CANCELAR</button>
                  <button onClick={handleSave} className="px-3 lg:px-4 py-2 rounded font-bold text-[10px] lg:text-xs tracking-widest bg-green-900/40 border border-green-700 text-green-400 hover:bg-green-800/60 transition-colors">SALVAR</button>
                </>
              ) : (
                <button onClick={() => setIsEditing(true)} className="px-4 py-2 rounded font-bold text-xs tracking-widest bg-red-900/20 border border-red-900/50 text-red-400 hover:bg-red-900/40 hover:text-red-300 transition-colors">EDITAR FICHA</button>
              )}
              <button onClick={onClose} className="w-10 h-10 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 flex items-center justify-center transition-colors font-bold ml-1">✕</button>
            </div>
          </header>

          <div className="flex gap-1 bg-zinc-900/30 border-b border-zinc-800/80 px-6 lg:px-8 py-2 shrink-0">
            <button onClick={() => setActiveSubTab('status')} className={`px-4 py-2 rounded-lg font-bold text-xs tracking-widest transition-all ${activeSubTab === 'status' ? 'bg-red-600/10 text-red-400 border border-red-900/30' : 'text-zinc-500 hover:text-zinc-300'}`}>STATUS & INVENTÁRIO</button>
            <button onClick={() => setActiveSubTab('pericias')} className={`px-4 py-2 rounded-lg font-bold text-xs tracking-widest transition-all ${activeSubTab === 'pericias' ? 'bg-red-600/10 text-red-400 border border-red-900/30' : 'text-zinc-500 hover:text-zinc-300'}`}>PERÍCIAS</button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-900/5 via-zinc-950 to-zinc-950">
            {activeSubTab === 'status' && (
              <div className="space-y-10 animate-fade-in">
                <section>
                  <div className="flex items-center gap-4 mb-6">
                    <h3 className="text-zinc-400 text-sm font-black uppercase tracking-[0.2em]">Atributos & Defesas</h3>
                    <div className="flex-1 h-px bg-gradient-to-r from-zinc-800 to-transparent"></div>
                  </div>
                  <div className="flex flex-col xl:flex-row gap-8 justify-around items-center bg-zinc-900/30 border border-zinc-800/80 p-6 rounded-xl">
                    <div className="flex flex-wrap justify-center gap-3 lg:gap-4">
                      {[{ key: 'agi', label: 'AGI' }, { key: 'for', label: 'FOR' }, { key: 'int', label: 'INT' }, { key: 'pre', label: 'PRE' }, { key: 'vig', label: 'VIG' }].map(attr => (
                        <div key={attr.key} className="w-16 lg:w-20 h-20 lg:h-24 bg-zinc-900 border border-zinc-700/50 flex flex-col items-center justify-center rounded-lg shadow-lg">
                          <span className="text-[9px] lg:text-[10px] text-zinc-500 font-bold mb-1 tracking-widest">{attr.label}</span>
                          {isEditing ? <input type="number" value={formData.attributes[attr.key]} onChange={(e) => handleAttrChange(attr.key, e.target.value)} className="bg-zinc-950 border border-red-900/50 text-xl font-black text-white text-center w-12 rounded" /> : <span className="text-2xl lg:text-3xl font-black text-zinc-100">{formData.attributes[attr.key]}</span>}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-4 border-t xl:border-t-0 xl:border-l border-zinc-800 pt-4 xl:pt-0 xl:pl-8 text-center">
                      <div>
                        <span className="block text-[10px] text-zinc-500 font-black uppercase mb-1">Defesa</span>
                        {isEditing ? <input type="number" value={formData.defense} onChange={(e) => handleChange('defense', parseInt(e.target.value)||0)} className="w-16 bg-zinc-950 border border-zinc-700 text-zinc-100 font-bold text-center rounded py-1 mx-auto" /> : <span className="text-2xl font-black text-zinc-100">{formData.defense}</span>}
                      </div>
                      <div>
                        <span className="block text-[10px] text-zinc-500 font-black uppercase mb-1">Esquiva</span>
                        {isEditing ? <input type="number" value={formData.dodge} onChange={(e) => handleChange('dodge', parseInt(e.target.value)||0)} className="w-16 bg-zinc-950 border border-zinc-700 text-zinc-100 font-bold text-center rounded py-1 mx-auto" /> : <span className="text-2xl font-black text-blue-400">{formData.dodge}</span>}
                      </div>
                      <div>
                        <span className="block text-[10px] text-zinc-500 font-black uppercase mb-1">Bloqueio</span>
                        {isEditing ? <input type="number" value={formData.block} onChange={(e) => handleChange('block', parseInt(e.target.value)||0)} className="w-16 bg-zinc-950 border border-zinc-700 text-zinc-100 font-bold text-center rounded py-1 mx-auto" /> : <span className="text-2xl font-black text-red-400">+{formData.block}</span>}
                      </div>
                    </div>
                  </div>
                </section>
                {/* Outras seções (Inventário, Poderes) continuam aqui... */}
              </div>
            )}
            {activeSubTab === 'pericias' && (
              <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {OFFICIAL_SKILLS.map(skill => {
                  const bonusValue = formData.skills?.[skill] || 0;
                  return (
                    <div key={skill} className="flex items-center justify-between p-3 bg-zinc-900/40 border border-zinc-800/80 rounded-lg">
                      <span className="font-mono text-sm text-zinc-300">{skill}</span>
                      {isEditing ? <input type="number" value={bonusValue} onChange={(e) => handleSkillChange(skill, e.target.value)} className="w-16 bg-zinc-950 border border-zinc-700 text-zinc-100 text-center rounded" /> : <span className={`font-mono font-black text-sm px-3 py-1 rounded border ${bonusValue > 0 ? 'bg-red-900/20 border-red-800/80 text-red-400' : 'bg-zinc-950 border-zinc-800 text-zinc-600'}`}>+{bonusValue}</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}