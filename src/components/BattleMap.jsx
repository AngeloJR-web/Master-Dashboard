import { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Center, useGLTF } from '@react-three/drei';

// ==========================================
// COMPONENTE: MINIATURA 3D DO MAPA
// ==========================================
function Mini3DModel({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene.clone()} />;
}

export function BattleMap({ players = [] }) {
  // ==========================================
  // ESTADOS DOS MAPAS E TOKENS
  // ==========================================
  const [maps, setMaps] = useState(() => {
    const saved = localStorage.getItem('ordo_maps_data');
    if (saved) {
      try {
        const parsedMaps = JSON.parse(saved);
        return parsedMaps.map(map => ({
          ...map,
          tokens: map.tokens.map(token => ({
            ...token,
            // VACINA 1: Remove URLs temporárias (blobs) que expiraram ao fechar o app
            // Isso evita o ícone de "imagem quebrada" e volta para a Letra Inicial.
            model3d: token.model3d && token.model3d.startsWith('blob:') ? null : token.model3d,
            avatarUrl: token.avatarUrl && token.avatarUrl.startsWith('blob:') ? null : token.avatarUrl,
          }))
        }));
      } catch (e) { return []; }
    }
    return [];
  });
  
  const [activeMapId, setActiveMapId] = useState(() => localStorage.getItem('ordo_active_map') || null);
  const [draggingToken, setDraggingToken] = useState(null);
  const mapRef = useRef(null);

  // ==========================================
  // ESTADOS DE CÂMERA (ZOOM E PAN DO MAPA)
  // ==========================================
  const [mapZoom, setMapZoom] = useState(1);
  const [mapPan, setMapPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPointer, setLastPointer] = useState({ x: 0, y: 0 });

  // ==========================================
  // ESTADOS DA BIBLIOTECA DE AMEAÇAS
  // ==========================================
  const [showLibrary, setShowLibrary] = useState(false);
  const [monsterLibrary, setMonsterLibrary] = useState(() => {
    const saved = localStorage.getItem('ordo_monster_library');
    if (saved) {
      try {
        return JSON.parse(saved).map(m => ({
          ...m,
          model3d: m.model3d && m.model3d.startsWith('blob:') ? null : m.model3d,
          avatarUrl: m.avatarUrl && m.avatarUrl.startsWith('blob:') ? null : m.avatarUrl,
        }));
      } catch (e) { return []; }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('ordo_maps_data', JSON.stringify(maps));
    if (activeMapId) localStorage.setItem('ordo_active_map', activeMapId);
    else localStorage.removeItem('ordo_active_map');
    localStorage.setItem('ordo_monster_library', JSON.stringify(monsterLibrary));
  }, [maps, activeMapId, monsterLibrary]);

  useEffect(() => {
    setMapZoom(1);
    setMapPan({ x: 0, y: 0 });
  }, [activeMapId]);

  const activeMap = maps.find(m => m.id === activeMapId);
  const updateActiveMap = (updates) => {
    setMaps(maps.map(m => m.id === activeMapId ? { ...m, ...updates } : m));
  };

  // ==========================================
  // FUNÇÕES DE MAPA E BIBLIOTECA
  // ==========================================
  const handleMapUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const mapName = window.prompt("Nome para este mapa (Ex: Porão):", "Novo Mapa") || "Mapa sem nome";
      const reader = new FileReader();
      reader.onloadend = () => {
        const newMap = { id: Date.now().toString(), name: mapName, bg: reader.result, tokens: [] };
        setMaps([...maps, newMap]);
        setActiveMapId(newMap.id);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = null;
  };

  const deleteMap = (idToRemove) => {
    if (window.confirm("Apagar este mapa permanentemente?")) {
      const remainingMaps = maps.filter(m => m.id !== idToRemove);
      setMaps(remainingMaps);
      if (activeMapId === idToRemove) setActiveMapId(remainingMaps.length > 0 ? remainingMaps[0].id : null);
    }
  };

  const handleAddMonsterToLibrary = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Limite de segurança para não travar o LocalStorage
      if (file.size > 2 * 1024 * 1024) {
        alert("O arquivo é muito pesado (Máx: 2MB). Escolha um arquivo menor para não travar o salvamento da campanha.");
        e.target.value = null;
        return;
      }

      const name = window.prompt("Nome da Ameaça (Ex: Zumbi de Sangue):", "Monstro") || "Monstro";
      const is3D = file.name.endsWith('.glb') || file.name.endsWith('.gltf');

      let isBorderless = false;
      if (!is3D && file.name.match(/\.(png|webp)$/i)) {
        isBorderless = window.confirm("Essa imagem tem fundo transparente (Estilo Isométrico)?\n\n[OK] = Sim, remover borda.\n[Cancelar] = Não, usar bolinha.");
      }

      // VACINA 2: Lê o arquivo como Base64 em vez de Blob. 
      // Isso salva a imagem DENTRO do banco de dados, impedindo que suma ao fechar o app!
      const reader = new FileReader();
      reader.onloadend = () => {
        const newMonster = { 
          id: Date.now(), 
          name: name, 
          model3d: is3D ? reader.result : null, 
          avatarUrl: !is3D ? reader.result : null, 
          isBorderless 
        };
        setMonsterLibrary(prev => [...prev, newMonster]);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = null;
  };

  const deleteMonsterFromLibrary = (id) => {
    if (window.confirm("Remover da biblioteca?")) setMonsterLibrary(monsterLibrary.filter(m => m.id !== id));
  };

  // ==========================================
  // MATEMÁTICA DE SPAWN (NASCE NO CENTRO DA TELA)
  // ==========================================
  const getCenterSpawnCoords = (tokenSize) => {
    if (!mapRef.current) return { x: 100, y: 100 };
    const rect = mapRef.current.getBoundingClientRect();
    
    const screenCenterX = window.innerWidth / 2;
    const screenCenterY = window.innerHeight / 2;
    const offset = tokenSize / 2;
    
    let x = (screenCenterX - rect.left) / mapZoom - offset;
    let y = (screenCenterY - rect.top) / mapZoom - offset;
    
    x += (Math.random() * 20) - 10;
    y += (Math.random() * 20) - 10;

    return { x, y };
  };

  // ==========================================
  // FUNÇÕES DE SPAWN DE TOKENS E REMOÇÃO
  // ==========================================
  const spawnPlayerToken = (player) => {
    if (!activeMap || activeMap.tokens.find(t => t.id === player.id)) return;
    const size = player.model3d ? 80 : 40;
    const coords = getCenterSpawnCoords(size);
    
    const newToken = { 
      id: player.id, name: player.name.split(' ')[0], avatarUrl: player.avatarUrl, model3d: player.model3d, 
      x: coords.x, y: coords.y, isPlayer: true, size: size, isBorderless: !!player.model3d 
    };
    updateActiveMap({ tokens: [...activeMap.tokens, newToken] });
  };

  const spawnMonsterToken = (monster) => {
    if (!activeMap) return;
    const isBorderless = monster.model3d || monster.isBorderless;
    const size = isBorderless ? 80 : 40;
    const coords = getCenterSpawnCoords(size);

    const newToken = { 
      id: `${monster.id}-${Date.now()}`, name: monster.name, avatarUrl: monster.avatarUrl, model3d: monster.model3d, 
      x: coords.x, y: coords.y, isPlayer: false, size: size, isBorderless: isBorderless 
    };
    updateActiveMap({ tokens: [...activeMap.tokens, newToken] });
    setShowLibrary(false);
  };

  const spawnGenericToken = () => {
    if (!activeMap) return;
    const npcName = window.prompt("Nome do NPC avulso:") || "Desconhecido";
    const coords = getCenterSpawnCoords(40);

    const newToken = { id: Date.now(), name: npcName, avatarUrl: null, model3d: null, x: coords.x, y: coords.y, isPlayer: false, size: 40, isBorderless: false };
    updateActiveMap({ tokens: [...activeMap.tokens, newToken] });
  };

  const removeToken = (e, tokenId) => {
    e.preventDefault();
    e.stopPropagation();
    updateActiveMap({ tokens: activeMap.tokens.filter(t => t.id !== tokenId) });
  };

  const renameToken = (tokenId, currentName) => {
    const newName = window.prompt("Novo nome:", currentName);
    if (newName && newName.trim() !== "") {
      updateActiveMap({ tokens: activeMap.tokens.map(t => t.id === tokenId ? { ...t, name: newName } : t) });
    }
  };

  // ==========================================
  // SISTEMA DE CÂMERA E DRAG
  // ==========================================
  const handlePointerDown = (e) => {
    if (e.button === 2) return;

    const tokenElement = e.target.closest('.token-element');
    if (tokenElement) {
      e.stopPropagation();
      const tokenId = tokenElement.getAttribute('data-token-id');
      
      if (e.shiftKey) {
        updateActiveMap({ tokens: activeMap.tokens.map(t => t.id.toString() === tokenId ? { ...t, isBorderless: !t.isBorderless } : t) });
        return; 
      }
      
      e.target.setPointerCapture(e.pointerId);
      setDraggingToken(tokenId);
      return;
    }

    e.preventDefault();
    e.target.setPointerCapture(e.pointerId);
    setIsPanning(true);
    setLastPointer({ x: e.clientX, y: e.clientY });
  };

  const handlePointerMove = (e) => {
    if (isPanning) {
      const dx = e.clientX - lastPointer.x;
      const dy = e.clientY - lastPointer.y;
      setMapPan(p => ({ x: p.x + dx, y: p.y + dy }));
      setLastPointer({ x: e.clientX, y: e.clientY });
      return;
    }

    if (draggingToken && mapRef.current && activeMap) {
      const rect = mapRef.current.getBoundingClientRect();
      const token = activeMap.tokens.find(t => t.id.toString() === draggingToken.toString());
      
      const isBorderless = token.model3d || token.isBorderless;
      const currentSize = token.size || (isBorderless ? 80 : 40);
      const offset = currentSize / 2; 

      let newX = (e.clientX - rect.left) / mapZoom - offset; 
      let newY = (e.clientY - rect.top) / mapZoom - offset;

      updateActiveMap({ tokens: activeMap.tokens.map(t => t.id.toString() === draggingToken.toString() ? { ...t, x: newX, y: newY } : t) });
    }
  };

  const handlePointerUp = (e) => {
    if (isPanning) {
      e.target.releasePointerCapture(e.pointerId);
      setIsPanning(false);
    }
    if (draggingToken) {
      setDraggingToken(null);
    }
  };

  const handleWheel = (e) => {
    const tokenElement = e.target.closest('.token-element');
    if (tokenElement) {
      e.stopPropagation();
      const tokenId = tokenElement.getAttribute('data-token-id');
      const zoomSpeed = e.deltaY < 0 ? 10 : -10; 
      updateActiveMap({
        tokens: activeMap.tokens.map(t => {
          if (t.id.toString() === tokenId) {
            const isBorderless = t.model3d || t.isBorderless;
            const currentSize = t.size || (isBorderless ? 80 : 40);
            return { ...t, size: Math.max(20, Math.min(currentSize + zoomSpeed, 600)) };
          }
          return t;
        })
      });
      return;
    }

    const zoomSpeed = e.deltaY < 0 ? 0.1 : -0.1;
    setMapZoom(prev => Math.max(0.2, Math.min(prev + zoomSpeed, 4)));
  };

  const resetCamera = () => {
    setMapZoom(1);
    setMapPan({ x: 0, y: 0 });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-fade-in bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-inner relative">
      
      {/* ABAS DOS MAPAS */}
      <div className="flex items-center gap-2 p-3 bg-zinc-900 border-b border-zinc-800 overflow-x-auto shrink-0 z-30">
        <i className="fa-solid fa-map text-zinc-600 mr-2"></i>
        {maps.map(m => (
          <div key={m.id} onClick={() => setActiveMapId(m.id)} className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition-colors ${activeMapId === m.id ? 'bg-red-900/40 border border-red-500 text-red-100' : 'bg-zinc-950 border border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}>
            <span className="text-xs font-bold whitespace-nowrap uppercase tracking-widest">{m.name}</span>
            <button onClick={(e) => { e.stopPropagation(); deleteMap(m.id); }} className="text-zinc-600 hover:text-red-500"><i className="fa-solid fa-xmark"></i></button>
          </div>
        ))}
        <label className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-950 border border-dashed border-zinc-700 hover:border-red-500 text-zinc-500 hover:text-red-400 transition-colors shrink-0 ml-2">
          <span className="text-xs font-bold tracking-widest">+ NOVO MAPA</span>
          <input type="file" accept="image/*" onChange={handleMapUpload} className="hidden" />
        </label>
      </div>

      {/* MODAL DO BESTIÁRIO */}
      {showLibrary && (
        <div className="absolute top-16 right-4 w-80 bg-zinc-950/95 border border-zinc-700 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-md z-50 flex flex-col max-h-[70%]">
          <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50 rounded-t-xl">
            <h3 className="font-black text-red-500 tracking-widest uppercase text-sm"><i className="fa-solid fa-book-skull mr-2"></i> Bestiário</h3>
            <button onClick={() => setShowLibrary(false)} className="text-zinc-500 hover:text-white">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {monsterLibrary.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center uppercase tracking-widest font-bold my-4">Nenhuma ameaça catalogada.</p>
            ) : (
              monsterLibrary.map(monster => (
                <div key={monster.id} className="flex items-center justify-between bg-zinc-900 border border-zinc-800 p-2 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-black border border-zinc-700 flex items-center justify-center text-red-500 text-xs font-black overflow-hidden relative">
                      {monster.model3d ? <span className="absolute text-[8px] bg-red-600 text-white px-1 py-0.5 bottom-0 rounded-t opacity-80 z-10">3D</span> : null}
                      {!monster.model3d && monster.isBorderless ? <span className="absolute text-[8px] bg-blue-600 text-white px-1 py-0.5 bottom-0 rounded-t opacity-80 z-10">ISO</span> : null}
                      {monster.avatarUrl ? <img src={monster.avatarUrl} alt="2D" className="w-full h-full object-cover" /> : <i className="fa-solid fa-ghost"></i>}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-200">{monster.name}</p>
                      <button onClick={() => spawnMonsterToken(monster)} className="text-[10px] text-blue-400 hover:text-blue-300 font-bold uppercase tracking-widest">+ Lançar</button>
                    </div>
                  </div>
                  <button onClick={() => deleteMonsterFromLibrary(monster.id)} className="text-zinc-600 hover:text-red-500 px-2">✕</button>
                </div>
              ))
            )}
          </div>
          <div className="p-4 border-t border-zinc-800 bg-zinc-900/30 rounded-b-xl">
            <label className="cursor-pointer block w-full text-center bg-red-900/20 border border-red-900/50 hover:bg-red-900/40 text-red-400 text-[10px] font-black uppercase tracking-widest py-3 rounded-lg transition-colors">
              <i className="fa-solid fa-upload mr-2"></i> Importar Ameaça (PNG/GLB)
              <input type="file" accept="image/*,.glb,.gltf" onChange={handleAddMonsterToLibrary} className="hidden" />
            </label>
          </div>
        </div>
      )}

      {/* MAPA PRINCIPAL */}
      <div 
        className={`flex-1 w-full h-full relative bg-black overflow-hidden select-none ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp} 
        onWheel={handleWheel}
        onContextMenu={(e) => e.preventDefault()} 
      >
        
        {/* HUD FLUTUANTE */}
        {activeMap && (
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-3 pointer-events-auto items-end">
            
            <div className="bg-black/80 backdrop-blur-md border border-zinc-800 p-2 rounded-lg flex gap-2 shadow-[0_0_20px_rgba(0,0,0,0.8)] items-center">
              <button onClick={resetCamera} className="h-8 px-3 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700 transition-colors" title="Centralizar Mapa">
                <i className="fa-solid fa-crosshairs"></i>
              </button>
              <div className="w-px h-6 bg-zinc-700 mx-1"></div>

              <button onClick={spawnGenericToken} className="h-8 px-2 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] font-black text-zinc-300 uppercase transition-colors" title="Adicionar Ponto Avulso">+ NPC</button>
              <button onClick={() => setShowLibrary(!showLibrary)} className={`h-8 px-4 rounded border font-black text-[10px] uppercase tracking-widest transition-colors ${showLibrary ? 'bg-red-600 border-red-500 text-white' : 'bg-red-900/30 border-red-900/50 text-red-400 hover:bg-red-900/50'}`}>
                <i className="fa-solid fa-book-skull mr-2"></i> Bestiário
              </button>
              
              <div className="w-px h-6 bg-zinc-700 mx-1"></div>
              {players.map(p => (
                <button key={p.id} onClick={() => spawnPlayerToken(p)} className={`w-8 h-8 rounded-full bg-zinc-800 border-2 transition-transform hover:scale-110 ${activeMap.tokens.find(t => t.id === p.id) ? 'border-zinc-700 opacity-20' : 'border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'}`}>
                  {p.avatarUrl ? <img src={p.avatarUrl} alt="Token" className="w-full h-full object-cover rounded-full" /> : <span className="text-xs font-black text-zinc-300">{p.name.charAt(0)}</span>}
                </button>
              ))}
            </div>

            {/* GUIA DE COMANDOS */}
            <div className="bg-black/60 px-4 py-3 rounded-lg border border-zinc-800 backdrop-blur text-right leading-relaxed pointer-events-none shadow-lg">
              <p className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.2em] mb-1 pb-1 border-b border-zinc-700/50">Câmera e Mapa</p>
              <p className="text-[10px] text-zinc-300 font-bold uppercase tracking-widest">Arrastar Fundo: <span className="text-blue-400">Mover</span></p>
              <p className="text-[10px] text-zinc-300 font-bold uppercase tracking-widest mb-3">Scroll Fundo: <span className="text-blue-400">Zoom</span></p>

              <p className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.2em] mb-1 pb-1 border-b border-zinc-700/50">Tokens</p>
              <p className="text-[10px] text-zinc-300 font-bold uppercase tracking-widest">Shift + Clique: <span className="text-green-400">Liga Borda</span></p>
              <p className="text-[10px] text-zinc-300 font-bold uppercase tracking-widest">Scroll Mouse: <span className="text-yellow-400">Tamanho</span></p>
              <p className="text-[10px] text-zinc-300 font-bold uppercase tracking-widest">Duplo clique: <span className="text-zinc-100">Renomear</span></p>
              <p className="text-[10px] text-zinc-300 font-bold uppercase tracking-widest">Botão Direito: <span className="text-red-500">Remover</span></p>
            </div>

          </div>
        )}

        {!activeMap ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <i className="fa-solid fa-satellite-dish text-zinc-800 text-[8rem] opacity-30 mb-6"></i>
            <h2 className="text-2xl font-black text-zinc-700 uppercase tracking-widest">Nenhum Mapa Ativo</h2>
            <p className="text-zinc-500 font-bold mt-2">Clique em "+ NOVO MAPA" na barra superior para iniciar.</p>
          </div>
        ) : (
          <div 
            ref={mapRef} 
            className="absolute inset-0 bg-center bg-no-repeat bg-contain" 
            style={{ 
              backgroundImage: `url(${activeMap.bg})`,
              transform: `translate(${mapPan.x}px, ${mapPan.y}px) scale(${mapZoom})`,
              transformOrigin: 'center center',
              transition: isPanning ? 'none' : 'transform 0.1s ease-out'
            }}
          >
            {/* TOKENS */}
            {activeMap.tokens.map(token => {
              const is3D = !!token.model3d;
              const isBorderless = is3D || (token.isBorderless && !!token.avatarUrl); 
              const tokenSize = token.size || (isBorderless ? 80 : 40);

              return (
                <div
                  key={token.id}
                  data-token-id={token.id} 
                  onContextMenu={(e) => removeToken(e, token.id)}
                  draggable={false} 
                  onDragStart={(e) => e.preventDefault()} 
                  className={`token-element absolute flex flex-col items-center justify-center cursor-grab active:cursor-grabbing z-10 transition-transform select-none 
                    ${!isBorderless ? 'rounded-full border-2 shadow-lg bg-zinc-900' : 'drop-shadow-2xl bg-transparent'} 
                    ${!isBorderless && token.isPlayer ? 'border-white' : ''} 
                    ${!isBorderless && !token.isPlayer ? 'border-red-500' : ''} 
                    ${draggingToken === token.id.toString() ? 'scale-[1.15] z-50 shadow-[0_0_30px_rgba(255,255,255,0.2)]' : 'hover:scale-105'}`}
                  style={{ 
                    left: `${token.x}px`, 
                    top: `${token.y}px`,
                    width: `${tokenSize}px`,
                    height: `${tokenSize}px`
                  }}
                >
                  
                  {is3D ? (
                    <div className="w-full h-full pointer-events-none flex items-center justify-center bg-transparent">
                      <Canvas camera={{ position: [0, 1.5, 4], fov: 50 }} style={{ background: 'transparent' }} alpha={true}>
                        <ambientLight intensity={2.5} />
                        <directionalLight position={[5, 10, 5]} intensity={2} />
                        <Suspense fallback={null}>
                          <Center><Mini3DModel url={token.model3d} /></Center>
                        </Suspense>
                      </Canvas>
                    </div>
                  ) : token.avatarUrl ? (
                    <img 
                      src={token.avatarUrl} 
                      alt="Token" 
                      draggable={false} 
                      className={`w-full h-full object-cover pointer-events-none select-none ${!isBorderless ? 'rounded-full' : ''}`} 
                    />
                  ) : (
                    <span className={`font-black pointer-events-none select-none ${token.isPlayer ? 'text-white' : 'text-red-200'}`} style={{ fontSize: `${Math.max(10, tokenSize / 3)}px` }}>
                      {token.name.charAt(0).toUpperCase()}
                    </span>
                  )}

                  <div className="absolute -bottom-6 bg-black/90 px-2 py-0.5 rounded text-[10px] font-bold text-white border border-zinc-700 pointer-events-none whitespace-nowrap shadow-md z-20 select-none"
                       style={{ transform: `scale(${1 / mapZoom})` }} 
                  >
                    {token.name}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}