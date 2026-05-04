import { useState, useEffect } from 'react';

export function PlayerCard({ player, onOpenDetails }) {
  const [currentHp, setCurrentHp] = useState(player.hp || 0);
  const [currentSanity, setCurrentSanity] = useState(player.sanity || 0);
  const [currentPe, setCurrentPe] = useState(player.pe || 0);

  useEffect(() => {
    if (currentHp > player.maxHp) setCurrentHp(player.maxHp);
    if (currentSanity > player.maxSanity) setCurrentSanity(player.maxSanity);
    if (currentPe > player.maxPe) setCurrentPe(player.maxPe);
  }, [player.maxHp, player.maxSanity, player.maxPe]);

  const hpPercent = Math.max(0, Math.min(100, (currentHp / player.maxHp) * 100));
  const sanityPercent = Math.max(0, Math.min(100, (currentSanity / player.maxSanity) * 100));
  const pePercent = Math.max(0, Math.min(100, (currentPe / player.maxPe) * 100));

  return (
    <div 
      className="group bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 flex flex-col gap-4 backdrop-blur-md shadow-lg transition-all hover:border-red-600/50 hover:shadow-[0_0_20px_rgba(220,38,38,0.15)] hover:-translate-y-1 cursor-pointer"
      onClick={() => onOpenDetails(player)}
    >
      <div className="flex items-center gap-4">
        {/* AVATAR DO JOGADOR AQUI */}
        <div className="w-14 h-14 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center group-hover:border-red-500 group-hover:bg-red-950/30 transition-colors shadow-inner shrink-0 overflow-hidden">
          {player.avatarUrl ? (
            <img src={player.avatarUrl} alt={player.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-zinc-500 font-black text-xl group-hover:text-red-500">{player.name.charAt(0)}</span>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-zinc-100 group-hover:text-red-400 transition-colors tracking-tight truncate">{player.name}</h3>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest truncate">{player.role}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 bg-zinc-950/50 border border-zinc-800/60 p-2 rounded-lg text-center" onClick={(e) => e.stopPropagation()}>
        <div>
          <span className="block text-[8px] text-zinc-500 font-black uppercase tracking-wider">Defesa</span>
          <span className="text-sm font-black text-zinc-200">{player.defense || 10}</span>
        </div>
        <div>
          <span className="block text-[8px] text-zinc-500 font-black uppercase tracking-wider">Esquiva</span>
          <span className="text-sm font-black text-blue-400">{player.dodge || 10}</span>
        </div>
        <div>
          <span className="block text-[8px] text-zinc-500 font-black uppercase tracking-wider">Bloqueio</span>
          <span className="text-sm font-black text-red-400">+{player.block || 0}</span>
        </div>
      </div>

      <div className="space-y-3 mt-1" onClick={(e) => e.stopPropagation()}>
        <div>
          <div className="flex justify-between items-center text-xs mb-1 font-bold">
            <span className="text-red-500 text-[10px] tracking-wider">VIDA</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentHp(p => Math.max(0, p - 1))} className="w-5 h-5 flex items-center justify-center bg-zinc-950 hover:bg-red-900/50 text-zinc-400 rounded border border-zinc-800 transition-colors">-</button>
              <span className="text-zinc-300 w-10 text-center font-mono text-xs">{currentHp}/{player.maxHp}</span>
              <button onClick={() => setCurrentHp(p => Math.min(player.maxHp, p + 1))} className="w-5 h-5 flex items-center justify-center bg-zinc-950 hover:bg-green-900/50 text-zinc-400 rounded border border-zinc-800 transition-colors">+</button>
            </div>
          </div>
          <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-800/50">
            <div className="h-full bg-red-600 transition-all duration-300" style={{ width: `${hpPercent}%` }}></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center text-xs mb-1 font-bold">
            <span className="text-blue-500 text-[10px] tracking-wider">SANIDADE</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentSanity(p => Math.max(0, p - 1))} className="w-5 h-5 flex items-center justify-center bg-zinc-950 hover:bg-red-900/50 text-zinc-400 rounded border border-zinc-800 transition-colors">-</button>
              <span className="text-zinc-300 w-10 text-center font-mono text-xs">{currentSanity}/{player.maxSanity}</span>
              <button onClick={() => setCurrentSanity(p => Math.min(player.maxSanity, p + 1))} className="w-5 h-5 flex items-center justify-center bg-zinc-950 hover:bg-blue-900/50 text-zinc-400 rounded border border-zinc-800 transition-colors">+</button>
            </div>
          </div>
          <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-800/50">
            <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${sanityPercent}%` }}></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center text-xs mb-1 font-bold">
            <span className="text-yellow-500 text-[10px] tracking-wider">PE</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPe(p => Math.max(0, p - 1))} className="w-5 h-5 flex items-center justify-center bg-zinc-950 hover:bg-red-900/50 text-zinc-400 rounded border border-zinc-800 transition-colors">-</button>
              <span className="text-zinc-300 w-10 text-center font-mono text-xs">{currentPe}/{player.maxPe}</span>
              <button onClick={() => setCurrentPe(p => Math.min(player.maxPe, p + 1))} className="w-5 h-5 flex items-center justify-center bg-zinc-950 hover:bg-yellow-900/50 text-zinc-400 rounded border border-zinc-800 transition-colors">+</button>
            </div>
          </div>
          <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-800/50">
            <div className="h-full bg-yellow-500 transition-all duration-300" style={{ width: `${pePercent}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}