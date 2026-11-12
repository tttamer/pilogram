import React from 'react';
import { Home, Bookmark, Shuffle, Sparkles, Compass } from 'lucide-react';
import type { SectionFilter } from '../types/post';

interface BottomNavProps {
  activeFilter: SectionFilter;
  bookmarkedCount: number;
  onSelectFilter: (filter: SectionFilter) => void;
  onShuffle: () => void;
  onLoopNow: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeFilter,
  bookmarkedCount,
  onSelectFilter,
  onShuffle,
  onLoopNow,
}) => {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-30 bg-black/95 backdrop-blur-xl border-t border-zinc-900 px-6 py-3 flex items-center justify-between">
      <button
        type="button"
        onClick={() => onSelectFilter('all')}
        className={`flex flex-col items-center gap-1 text-[10px] transition ${
          activeFilter === 'all' ? 'text-white font-bold scale-105' : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <Home className="w-6 h-6" />
        <span>Feed</span>
      </button>

      <button
        type="button"
        onClick={() => onSelectFilter('external')}
        className={`flex flex-col items-center gap-1 text-[10px] transition ${
          activeFilter === 'external' ? 'text-violet-400 font-bold scale-105' : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <Compass className="w-6 h-6" />
        <span>Explorar</span>
      </button>

      <button
        type="button"
        onClick={onShuffle}
        className="flex flex-col items-center gap-1 text-[10px] text-zinc-400 hover:text-sky-400 transition"
      >
        <Shuffle className="w-6 h-6" />
        <span>Sortear</span>
      </button>

      <button
        type="button"
        onClick={() => onSelectFilter('bookmarks')}
        className={`relative flex flex-col items-center gap-1 text-[10px] transition ${
          activeFilter === 'bookmarks'
            ? 'text-amber-400 font-bold scale-105'
            : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <Bookmark className="w-6 h-6" />
        <span>Revisão ({bookmarkedCount})</span>
      </button>

      <button
        type="button"
        onClick={onLoopNow}
        className="flex flex-col items-center gap-1 text-[10px] text-sky-400 hover:text-sky-300 font-semibold transition"
      >
        <Sparkles className="w-6 h-6" />
        <span>Novo Loop</span>
      </button>
    </nav>
  );
};
