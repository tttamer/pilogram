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
      className="bg-gradient-to-b from-emerald-950/50 via-zinc-950 to-zinc-950 border-y border-zinc-800 p-4 iphone:p-5 space-y-4 cursor-pointer"
    >
      <div className="flex items-center justify-between text-xs">
        <span className="inline-flex items-center gap-1.5 font-bold text-emerald-400 uppercase tracking-wider text-[11px] iphone:text-xs">
          <Play className="w-3.5 h-3.5 fill-emerald-400" /> Short Reel ({video.duration_seconds}s)
        </span>
        <span className="text-zinc-400 text-[11px] iphone:text-xs">{post.source.anchor_concept}</span>
      </div>

      {video.video_url ? (
        <video
          src={video.video_url}
          autoPlay
          loop
          muted
          playsInline
          className="w-full rounded-xl max-h-72 object-cover border border-zinc-800"
        />
      ) : (
        video.animated_svg_url && (
          <img
            src={video.animated_svg_url}
            alt={video.hook_overlay}
            className="w-full h-40 iphone:h-44 object-contain rounded-xl bg-zinc-950 border border-zinc-800 p-2 animate-pulse"
          />
        )
      )}

      <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-2.5">
        <h4 className="text-xs iphone:text-sm font-bold text-white">{video.hook_overlay}</h4>
        <ul className="space-y-1.5">
          {video.key_takeaways.map((point, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2 text-xs text-zinc-200 leading-relaxed"
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
