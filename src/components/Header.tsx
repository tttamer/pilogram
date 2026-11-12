import React from 'react';
import { Shuffle, Sparkles } from 'lucide-react';

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
    <header className="sticky top-0 z-30 bg-black/90 backdrop-blur-md border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-sky-400 via-indigo-400 to-amber-300 bg-clip-text text-transparent">
          PSCPP•Gram
        </span>
        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-300">
          Ciclo #{cycleCount} • {seenCount}/{totalStudyPosts}
        </span>
        {needsGeneration && (
          <span
            title="Loop local sinalizado para gerar novos posts"
            className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40"
          >
            <Sparkles className="w-3 h-3" /> Loop Ativo
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={onShuffle}
        aria-label="Reembaralhar timeline"
        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-sky-400 border border-zinc-700 transition"
      >
        <Shuffle className="w-3.5 h-3.5" />
        <span>Reembaralhar</span>
      </button>
    </header>
  );
};
