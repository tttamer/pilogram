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
  { id: 'all', shortLabel: 'Tudo', subLabel: 'Feed Mix', gradient: 'from-pink-500 via-red-500 to-yellow-500' },
  { id: 'sec-1', shortLabel: 'Seção I', subLabel: 'Manobra', gradient: 'from-sky-400 to-blue-600' },
  { id: 'sec-2', shortLabel: 'Seção II', subLabel: 'Arte Naval', gradient: 'from-amber-400 to-orange-600' },
  { id: 'sec-3', shortLabel: 'Seção III', subLabel: 'Restritas', gradient: 'from-emerald-400 to-teal-600' },
  { id: 'sec-4', shortLabel: 'Seção IV', subLabel: 'NORMAM', gradient: 'from-rose-400 to-red-600' },
  { id: 'sec-5', shortLabel: 'Seção V', subLabel: 'Nav/Meteo', gradient: 'from-cyan-400 to-sky-600' },
  { id: 'sec-6', shortLabel: 'Seção VI', subLabel: 'CIS/SMCP', gradient: 'from-yellow-400 to-amber-600' },
  { id: 'sec-7', shortLabel: 'Seção VII', subLabel: 'RIPEAM', gradient: 'from-fuchsia-400 to-pink-600' },
  { id: 'external', shortLabel: 'Social', subLabel: 'IG / In', gradient: 'from-violet-400 to-indigo-600' },
];

export const StoriesBar: React.FC<StoriesBarProps> = ({
  activeFilter,
  onSelectFilter,
}) => {
  return (
    <nav
      aria-label="Filtro por Seções do Edital"
      className="border-b border-zinc-900 bg-black py-3 px-3 overflow-x-auto no-scrollbar"
    >
      <div className="flex items-center gap-3">
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
                  isActive ? 'ring-2 ring-white scale-105' : 'opacity-80 group-hover:opacity-100'
                } transition`}
              >
                <div className="w-14 h-14 rounded-full bg-zinc-950 border-2 border-black flex flex-col items-center justify-center">
                  <span className="text-[11px] font-bold text-white leading-tight">
                    {story.shortLabel}
                  </span>
                </div>
              </div>
              <span
                className={`mt-1 text-[10px] ${
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
