import React from 'react';
import { Home, Bookmark, Shuffle, Sparkles } from 'lucide-react';
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
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-30 bg-black/95 backdrop-blur-md border-t border-zinc-800 px-4 iphone:px-6 py-2.5 flex items-center justify-between">
      <button
        type="button"
        onClick={() => onSelectFilter('all')}
        className={`flex flex-col items-center gap-0.5 text-[10px] ${
          activeFilter === 'all' ? 'text-white font-bold' : 'text-zinc-400'
        }`}
      >
        <Home className="w-5 h-5" />
        <span>Timeline</span>
      </button>

      <button
        type="button"
        onClick={onShuffle}
        className="flex flex-col items-center gap-0.5 text-[10px] text-zinc-400 hover:text-white"
      >
        <Shuffle className="w-5 h-5" />
        <span>Sortear</span>
      </button>

      <button
        type="button"
        onClick={() => onSelectFilter('bookmarks')}
        className={`relative flex flex-col items-center gap-0.5 text-[10px] ${
          activeFilter === 'bookmarks'
            ? 'text-amber-400 font-bold'
            : 'text-zinc-400'
        }`}
      >
        <Bookmark className="w-5 h-5" />
        <span>Revisão ({bookmarkedCount})</span>
      </button>

      <button
        type="button"
        onClick={onLoopNow}
        className="flex flex-col items-center gap-0.5 text-[10px] text-sky-400 font-semibold"
      >
        <Sparkles className="w-5 h-5" />
        <span>Novo Loop</span>
      </button>
    </nav>
  );
};
