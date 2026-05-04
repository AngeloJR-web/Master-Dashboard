import { useState } from 'react';

export function NotesPanel() {
  // Lista inicial com um documento de exemplo
  const [notes, setNotes] = useState([
    { id: 1, title: 'ARQUIVO_CONFIDENCIAL_01', content: '> Relatório de Missão...\n> Status: Em andamento.\n\n[INSERIR INFORMAÇÕES AQUI]' }
  ]);
  const [activeNoteId, setActiveNoteId] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const activeNote = notes.find(n => n.id === activeNoteId);

  // Cria um novo arquivo em branco
  const handleAddNote = () => {
    const newNote = {
      id: Date.now(),
      title: 'NOVO_DOCUMENTO',
      content: ''
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id); // Já abre o arquivo novo
  };

  // Exclui um arquivo
  const handleDeleteNote = (id) => {
    if (window.confirm("Apagar documento confidencial?")) {
      const newNotes = notes.filter(n => n.id !== id);
      setNotes(newNotes);
      // Se apagou o arquivo que estava aberto, abre o primeiro da lista
      if (activeNoteId === id) {
        setActiveNoteId(newNotes.length > 0 ? newNotes[0].id : null);
      }
    }
  };

  // Atualiza o título ou o conteúdo em tempo real
  const updateActiveNote = (field, value) => {
    setNotes(notes.map(n => n.id === activeNoteId ? { ...n, [field]: value } : n));
  };

  // Filtra as anotações pela barra de pesquisa
  const filteredNotes = notes.filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full min-h-[600px]">
      
      {/* Lado Esquerdo: Navegador de Arquivos */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
        <button onClick={handleAddNote} className="w-full py-3 bg-red-900/40 hover:bg-red-800/60 border border-red-700 text-red-100 font-bold rounded-lg transition-all tracking-widest uppercase text-xs shadow-md">
          + NOVO DOCUMENTO
        </button>
        
        <input 
          type="text" 
          placeholder="Buscar arquivos..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-zinc-900/80 border border-zinc-800 text-zinc-300 px-4 py-2 rounded-lg focus:outline-none focus:border-red-500 font-mono text-sm shadow-inner"
        />

        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {filteredNotes.map(note => (
            <div 
              key={note.id} 
              onClick={() => setActiveNoteId(note.id)}
              className={`p-3 rounded-lg border cursor-pointer transition-all flex justify-between items-center group ${activeNoteId === note.id ? 'bg-zinc-800 border-red-500/50' : 'bg-zinc-900/50 border-zinc-800/50 hover:border-zinc-700'}`}
            >
              <span className={`font-mono text-sm truncate ${activeNoteId === note.id ? 'text-red-400 font-bold' : 'text-zinc-500'}`}>
                {/* Correção do JSX aqui: envelopando o símbolo de maior */}
                {'>'} {note.title || 'Sem Título'}
              </span>
              <button 
                onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }}
                className="text-zinc-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity font-bold"
                title="Deletar arquivo"
              >
                ✕
              </button>
            </div>
          ))}
          {filteredNotes.length === 0 && <p className="text-zinc-600 font-mono text-xs text-center mt-4 uppercase">Nenhum arquivo encontrado.</p>}
        </div>
      </div>

      {/* Lado Direito: Editor Terminal */}
      <div className="flex-1 bg-black border border-zinc-800 rounded-xl overflow-hidden flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.5)] relative">
        
        {/* Barra superior "falsa" do sistema operacional */}
        <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-2 flex items-center justify-between z-20 relative">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
          </div>
          <span className="text-zinc-600 font-mono text-[10px] uppercase tracking-widest">Ordo_Realitas_OS_v3.1</span>
        </div>

        {/* Efeito Visual de Monitor Antigo (Scanlines) */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-10 opacity-30"></div>

        {activeNote ? (
          <div className="flex-1 flex flex-col p-6 z-20 relative">
            {/* Título do Documento */}
            <input 
              type="text" 
              value={activeNote.title}
              onChange={(e) => updateActiveNote('title', e.target.value.toUpperCase())}
              className="bg-transparent border-none text-red-500 font-mono text-xl font-bold focus:outline-none mb-4 w-full uppercase tracking-wider"
              placeholder="NOME_DO_ARQUIVO"
              spellCheck="false"
            />
            {/* Área de Texto Livre */}
            <textarea 
              value={activeNote.content}
              onChange={(e) => updateActiveNote('content', e.target.value)}
              className="flex-1 w-full bg-transparent border-none text-green-500 font-mono text-sm leading-relaxed focus:outline-none resize-none"
              placeholder="> Digite suas anotações aqui... O sistema salva automaticamente na memória."
              spellCheck="false"
            ></textarea>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center z-20 relative">
            <span className="text-zinc-700 font-mono text-sm tracking-widest animate-pulse">_SELECIONE_UM_ARQUIVO_</span>
          </div>
        )}
      </div>

    </div>
  );
}