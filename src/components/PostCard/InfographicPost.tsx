import React, { useState } from 'react';
import { MapPin } from 'lucide-react';
import type { StudyPost } from '../../types/post';

interface InfographicPostProps {
  post: StudyPost;
  onInteract: () => void;
}

export const InfographicPost: React.FC<InfographicPostProps> = ({
  post,
  onInteract,
}) => {
  const info = post.infographic;
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(
    info?.hotspots[0]?.id ?? null
  );

  if (!info) return null;
  const activeHotspot = info.hotspots.find((h) => h.id === activeHotspotId);

  return (
    <div className="bg-zinc-950 border-y border-zinc-900 p-5 space-y-4">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-purple-400 uppercase tracking-widest text-[10px] iphone:text-[11px] bg-purple-500/10 px-2.5 py-1 rounded-md border border-purple-500/20">
          Infográfico Técnico
        </span>
        <span className="text-zinc-400 text-[11px]">
          Toque nos pinos ({info.hotspots.length} pontos)
        </span>
      </div>

      <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-black/60 p-2 shadow-inner">
        <img
          src={info.image_url}
          alt={post.source.anchor_concept}
          className="w-full h-56 iphone:h-64 object-contain"
        />
        {info.hotspots.map((hs, index) => {
          const isSelected = hs.id === activeHotspotId;
          return (
            <button
              key={hs.id}
              type="button"
              onClick={() => {
                onInteract();
                setActiveHotspotId(hs.id);
              }}
              style={{ left: `${hs.x}%`, top: `${hs.y}%` }}
              className={`-translate-x-1/2 -translate-y-1/2 absolute w-7 h-7 iphone:w-8 iphone:h-8 rounded-full font-bold text-xs flex items-center justify-center shadow-md transition-all duration-200 ${
                isSelected
                  ? 'bg-amber-400 text-black ring-4 ring-amber-400/30 scale-110 shadow-amber-400/30'
                  : 'bg-sky-500 text-white hover:scale-105 shadow-sky-500/30'
              }`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>

      {activeHotspot && (
        <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-1.5 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
            <MapPin className="w-4 h-4 text-amber-400" />
            <span className="text-sm">{activeHotspot.label}</span>
          </div>
          <p className="text-xs iphone:text-[13px] text-zinc-200 leading-relaxed pl-5">
            {activeHotspot.detail}
          </p>
        </div>
      )}
    </div>
  );
};
