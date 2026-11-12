import React from 'react';
import { Play, CheckCircle2 } from 'lucide-react';
import type { StudyPost } from '../../types/post';

interface VideoReelPostProps {
  post: StudyPost;
  onInteract: () => void;
}

export const VideoReelPost: React.FC<VideoReelPostProps> = ({
  post,
  onInteract,
}) => {
  const video = post.video;
  if (!video) return null;

  return (
    <div
      onClick={onInteract}
      className="bg-zinc-950 border-y border-zinc-900 p-5 space-y-4 cursor-pointer"
    >
      <div className="flex items-center justify-between text-xs">
        <span className="inline-flex items-center gap-1.5 font-bold text-emerald-400 uppercase tracking-widest text-[10px] iphone:text-[11px] bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
          <Play className="w-3.5 h-3.5 fill-emerald-400" /> Reel ({video.duration_seconds}s)
        </span>
        <span className="text-zinc-400 text-[11px] font-medium">{post.source.anchor_concept}</span>
      </div>

      {video.video_url ? (
        <video
          src={video.video_url}
          autoPlay
          loop
          muted
          playsInline
          className="w-full rounded-2xl max-h-80 object-cover border border-zinc-800 shadow-md"
        />
      ) : (
        video.animated_svg_url && (
          <div className="rounded-2xl overflow-hidden bg-black/60 border border-zinc-800 p-3 shadow-inner">
            <img
              src={video.animated_svg_url}
              alt={video.hook_overlay}
              className="w-full h-44 iphone:h-52 object-contain animate-pulse"
            />
          </div>
        )
      )}

      <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3 shadow-sm">
        <h4 className="text-sm iphone:text-[15px] font-bold text-white tracking-tight leading-snug">
          {video.hook_overlay}
        </h4>
        <ul className="space-y-2">
          {video.key_takeaways.map((point, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2.5 text-xs iphone:text-sm text-zinc-200 leading-relaxed"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
