import React from 'react';
import { Shuffle, Sparkles, Instagram } from 'lucide-react';

interface HeaderProps {
  cycleCount: number;
  seenCount: number;
  totalStudyPosts: number;
  needsGeneration: boolean;
  onShuffle: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cycleCount,
  seenCount,
  totalStudyPosts,
  needsGeneration,
  onShuffle,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-black/95 backdrop-blur-xl border-b border-zinc-800/80 px-4 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <Instagram className="w-5 h-5 text-white" />
          <span className="font-bold text-xl tracking-tight text-white select-none">
            Pilogram
          </span>
        </div>
        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300">
          Ciclo #{cycleCount} • {seenCount}/{totalStudyPosts}
        </span>
        {needsGeneration && (
          <span
            title="Loop local sinalizado para novos posts"
            className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40"
          >
            <Sparkles className="w-3 h-3" /> Loop
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={onShuffle}
        aria-label="Reembaralhar timeline"
        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-sky-400 border border-zinc-800 transition shadow-sm"
      >
        <Shuffle className="w-3.5 h-3.5" />
        <span>Reembaralhar</span>
      </button>
    </header>
  );
};
