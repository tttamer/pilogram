import React from 'react';
import type { SectionFilter } from '../types/post';

interface StoriesBarProps {
  activeFilter: SectionFilter;
  onSelectFilter: (filter: SectionFilter) => void;
  bookmarkedCount: number;
}

const STORIES: Array<{
  id: SectionFilter;
  shortLabel: string;
  subLabel: string;
  gradient: string;
}> = [
  { id: 'all', shortLabel: 'Todos', subLabel: 'Feed', gradient: 'from-amber-400 via-rose-500 to-purple-600' },
  { id: 'sec-1', shortLabel: 'Seção I', subLabel: 'Manobra', gradient: 'from-sky-400 via-blue-500 to-indigo-600' },
  { id: 'sec-2', shortLabel: 'Seção II', subLabel: 'Arte Naval', gradient: 'from-amber-400 via-orange-500 to-red-600' },
  { id: 'sec-3', shortLabel: 'Seção III', subLabel: 'Restritas', gradient: 'from-emerald-400 via-teal-500 to-cyan-600' },
  { id: 'sec-4', shortLabel: 'Seção IV', subLabel: 'NORMAM', gradient: 'from-rose-400 via-pink-500 to-rose-600' },
  { id: 'sec-5', shortLabel: 'Seção V', subLabel: 'Nav/Meteo', gradient: 'from-cyan-400 via-sky-500 to-blue-600' },
  { id: 'sec-6', shortLabel: 'Seção VI', subLabel: 'CIS/SMCP', gradient: 'from-yellow-400 via-amber-500 to-orange-500' },
  { id: 'sec-7', shortLabel: 'Seção VII', subLabel: 'RIPEAM', gradient: 'from-fuchsia-400 via-purple-500 to-pink-600' },
  { id: 'external', shortLabel: 'Social', subLabel: 'IG / In', gradient: 'from-violet-500 via-purple-500 to-indigo-600' },
];

export const StoriesBar: React.FC<StoriesBarProps> = ({
  activeFilter,
  onSelectFilter,
}) => {
  return (
    <nav
      aria-label="Filtro por Seções do Edital"
      className="border-b border-zinc-900 bg-black pt-3 pb-3.5 px-3.5 overflow-x-auto no-scrollbar"
    >
      <div className="flex items-center gap-4">
        {STORIES.map((story) => {
          const isActive = activeFilter === story.id;
          return (
            <button
              key={story.id}
              type="button"
              onClick={() => onSelectFilter(story.id)}
              className="flex flex-col items-center shrink-0 group focus:outline-none"
            >
              <div
                className={`p-[2.5px] rounded-full bg-gradient-to-tr ${story.gradient} ${
                  isActive
                    ? 'ring-2 ring-white scale-105'
                    : 'opacity-90 group-hover:opacity-100 hover:scale-[1.02]'
                } transition-all duration-200`}
              >
                <div className="w-[62px] h-[62px] rounded-full bg-zinc-950 p-[2px] flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center">
                    <span className="text-[11px] font-bold text-white tracking-tight leading-tight">
                      {story.shortLabel}
                    </span>
                  </div>
                </div>
              </div>
              <span
                className={`mt-1.5 text-[11px] tracking-tight ${
                  isActive ? 'text-white font-semibold' : 'text-zinc-400'
                }`}
              >
                {story.subLabel}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
