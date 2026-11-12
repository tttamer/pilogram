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
    <div className="bg-zinc-950 border-y border-zinc-800 p-4 space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-purple-400 uppercase tracking-wider text-[11px] iphone:text-xs">
          Infográfico Interativo
        </span>
        <span className="text-zinc-400 text-[11px] iphone:text-xs">
          Toque nos pontos (1–{info.hotspots.length})
        </span>
      </div>

      <div className="relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900">
        <img
          src={info.image_url}
          alt={post.source.anchor_concept}
          className="w-full h-52 iphone:h-56 object-contain"
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
              className={`-translate-x-1/2 -translate-y-1/2 absolute w-6 h-6 iphone:w-7 iphone:h-7 rounded-full font-bold text-xs flex items-center justify-center shadow-lg transition ${
                isSelected
                  ? 'bg-amber-400 text-black ring-4 ring-amber-400/40 scale-110'
                  : 'bg-sky-500 text-white hover:scale-105'
              }`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>

      {activeHotspot && (
        <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-700 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
            <MapPin className="w-3.5 h-3.5" />
            <span>{activeHotspot.label}</span>
          </div>
          <p className="text-xs text-zinc-200 leading-relaxed">
            {activeHotspot.detail}
          </p>
        </div>
      )}
    </div>
  );
};
