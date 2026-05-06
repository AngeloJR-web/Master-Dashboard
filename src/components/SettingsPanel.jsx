import { useState } from 'react';

export function SettingsPanel({ 
  themeColor, setThemeColor, 
  uiScale, setUiScale, 
  gmName, setGmName,
  showScanlines, setShowScanlines,
  setPlayers 
}) {
  const [showDangerZone, setShowDangerZone] = useState(false);

  // ========================================================
  // SISTEMA DE BACKUP COM "FILE SYSTEM ACCESS API" (FORÇA O SALVAR COMO)
  // ========================================================
  const exportDatabase = async () => {
    try {
      // 1. Coleta os dados
      const backupData = {
        players: JSON.parse(localStorage.getItem('ordo_alvarus_players') || '[]'),
        npcs: JSON.parse(localStorage.getItem('ordo_npcs') || '[]'),
        notes: JSON.parse(localStorage.getItem('ordo_notes') || '[]'),
        maps: JSON.parse(localStorage.getItem('ordo_maps_data') || '[]'),
        monsters: JSON.parse(localStorage.getItem('ordo_monster_library') || '[]'),
        settings: { themeColor, uiScale, gmName, showScanlines },
        timestamp: new Date().toISOString()
      };

      const jsonString = JSON.stringify(backupData, null, 2);
      const dataFormatada = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
      const defaultFileName = `ordo_backup_${dataFormatada}.json`;

      // 2. Verifica se o sistema/navegador suporta a API moderna de arquivos
      if (window.showSaveFilePicker) {
        // Isso ABRE a janela do Windows "Salvar Como" obrigatoriamente
        const fileHandle = await window.showSaveFilePicker({
          suggestedName: defaultFileName,
          types: [{
            description: 'Arquivo de Backup Ordo Alvarus',
            accept: { 'application/json': ['.json'] },
          }],
        });
        
        // Escreve os dados no arquivo que o usuário escolheu
        const writable = await fileHandle.createWritable();
        await writable.write(jsonString);
        await writable.close();
        
        alert("Backup salvo com sucesso na pasta escolhida!");
      } 
      else {
        // Fallback para navegadores mais antigos (método anterior)
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.href = url;
        downloadAnchorNode.download = defaultFileName;
        document.body.appendChild(downloadAnchorNode); 
        downloadAnchorNode.click();
        document.body.removeChild(downloadAnchorNode);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        alert("Backup gerado! Verifique sua pasta de Downloads.");
      }
    } catch (error) {
      // Se o usuário clicar em "Cancelar" na janela de salvar, o sistema lança um erro 'AbortError'. Nós o ignoramos.
      if (error.name !== 'AbortError') {
        console.error("Erro ao gerar backup:", error);
        alert("Ocorreu um erro ao tentar exportar o banco de dados.");
      }
    }
  };

  // ========================================================
  // SISTEMA DE RESTAURAÇÃO (IMPORTAR)
  // ========================================================
  const importDatabase = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!window.confirm("ATENÇÃO: Importar um backup apagará toda a campanha atual e a substituirá pelos dados do arquivo. Deseja continuar?")) {
      e.target.value = null;
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        
        if (!importedData.players || !importedData.timestamp) {
          throw new Error("Arquivo de backup inválido.");
        }

        localStorage.setItem('ordo_alvarus_players', JSON.stringify(importedData.players));
        localStorage.setItem('ordo_npcs', JSON.stringify(importedData.npcs || []));
        localStorage.setItem('ordo_notes', JSON.stringify(importedData.notes || []));
        localStorage.setItem('ordo_maps_data', JSON.stringify(importedData.maps || []));
        localStorage.setItem('ordo_monster_library', JSON.stringify(importedData.monsters || []));

        if (importedData.settings) {
          localStorage.setItem('ordo_theme_color', importedData.settings.themeColor || 'red');
          localStorage.setItem('ordo_ui_scale', importedData.settings.uiScale || 1);
          localStorage.setItem('ordo_gm_name', importedData.settings.gmName || 'Mestre');
          localStorage.setItem('ordo_show_scanlines', importedData.settings.showScanlines !== false);
        }

        setPlayers(importedData.players);
        alert("Sistema restaurado com sucesso! A página será recarregada.");
        window.location.reload();
        
      } catch (error) {
        alert("Erro ao ler o arquivo. Certifique-se de que é um backup válido do Ordo Alvarus (.json).");
      }
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  const themes = [
    { id: 'red', name: 'Sangue', hex: '#dc2626' },
    { id: 'green', name: 'Morte', hex: '#16a34a' },
    { id: 'blue', name: 'Conhecimento', hex: '#2563eb' },
    { id: 'yellow', name: 'Energia', hex: '#ca8a04' },
    { id: 'purple', name: 'Medo', hex: '#9333ea' }
  ];

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <header className="mb-10 border-b border-zinc-800/50 pb-6">
        <h2 className="text-4xl font-black text-zinc-100 tracking-tighter uppercase italic">Configurações do Sistema</h2>
      </header>

      <div className="space-y-8">
        
        {/* PERSONALIZAÇÃO VISUAL */}
        <section className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-sm font-black text-zinc-400 uppercase tracking-[0.2em] mb-8">Interface e Visual</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <p className="text-xs font-bold text-zinc-500 uppercase mb-4">Cor de Destaque (Elemento)</p>
              <div className="flex flex-wrap gap-3">
                {themes.map(t => (
                  <button key={t.id} onClick={() => setThemeColor(t.id)} className={`w-10 h-10 rounded-full border-2 transition-all ${themeColor === t.id ? 'border-white scale-110 shadow-lg' : 'border-transparent'}`} style={{ backgroundColor: t.hex }} title={t.name}></button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-zinc-500 uppercase mb-4">Zoom da Interface: {(uiScale * 100).toFixed(0)}%</p>
              <input type="range" min="0.7" max="1.3" step="0.05" value={uiScale} onChange={(e) => setUiScale(parseFloat(e.target.value))} className="w-full accent-zinc-100" />
              <p className="text-[9px] text-zinc-600 mt-2 uppercase">Ajuste o tamanho de botões e textos para sua resolução.</p>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-zinc-800/50 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-zinc-200 uppercase">Efeito de Scanlines</p>
              <p className="text-[10px] text-zinc-500 uppercase">Linhas de monitor antigo na tela (Estilo CRT).</p>
            </div>
            <button onClick={() => setShowScanlines(!showScanlines)} className={`w-12 h-6 rounded-full transition-colors relative ${showScanlines ? 'bg-green-600' : 'bg-zinc-800'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${showScanlines ? 'left-7' : 'left-1'}`}></div>
            </button>
          </div>
        </section>

        {/* IDENTIDADE DO MESTRE */}
        <section className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-sm font-black text-zinc-400 uppercase tracking-[0.2em] mb-8">Identidade Narrativa</h3>
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase mb-2">Nome do Mestre no Log de Dados</p>
            <input type="text" value={gmName} onChange={(e) => setGmName(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-lg outline-none focus:border-zinc-500 text-zinc-200 font-bold" />
          </div>
        </section>

        {/* BACKUP E DADOS */}
        <section className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-sm font-black text-zinc-400 uppercase tracking-[0.2em] mb-6">Backup de Campanha</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button onClick={exportDatabase} className="bg-zinc-950 border border-zinc-800 hover:border-zinc-600 p-4 rounded-lg text-xs font-bold uppercase transition-all">Exportar Campanha (.json)</button>
            <label className="cursor-pointer bg-zinc-950 border border-zinc-800 hover:border-zinc-600 p-4 rounded-lg text-xs font-bold uppercase transition-all text-center">
              Importar Campanha
              <input type="file" accept=".json" onChange={importDatabase} className="hidden" />
            </label>
          </div>
        </section>

        <section className="bg-red-950/10 border border-red-900/20 rounded-xl p-6">
          <button onClick={() => setShowDangerZone(!showDangerZone)} className="text-xs font-black text-red-900 uppercase tracking-widest hover:text-red-600 transition-colors">Zona de Perigo {showDangerZone ? '−' : '+'}</button>
          {showDangerZone && (
            <div className="mt-4 p-4 bg-black/40 rounded border border-red-900/30 flex justify-between items-center animate-fade-in">
              <p className="text-[10px] text-red-900/60 font-bold uppercase italic">Apagar todos os dados permanentemente?</p>
              <button onClick={() => { if(window.confirm("RESETAR TUDO? ESSA AÇÃO NÃO TEM VOLTA.")) { localStorage.clear(); window.location.reload(); } }} className="bg-red-600 text-white text-[9px] px-4 py-2 rounded font-black hover:bg-red-500 transition-colors">RESET TOTAL</button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}