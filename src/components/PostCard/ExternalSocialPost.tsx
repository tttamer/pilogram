import React from 'react';
import { ExternalLink, Globe } from 'lucide-react';
import type { ExternalPost } from '../../types/post';

interface ExternalSocialPostProps {
  post: ExternalPost;
}

export const ExternalSocialPost: React.FC<ExternalSocialPostProps> = ({
  post,
}) => {
  return (
    <article className="border-b border-zinc-900 bg-black pb-6 pt-1">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-500 to-fuchsia-600 p-[2px] flex items-center justify-center shadow-sm">
            <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center font-bold text-xs text-white">
              {post.platform === 'linkedin' ? 'in' : 'IG'}
            </div>
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>{post.author.display_name}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                Feed Externo
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">@{post.author.handle}</p>
          </div>
        </div>
        <a
          href={post.external_url}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-semibold text-sky-400 hover:text-sky-300 inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 transition"
        >
          <span>Ver Original</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {post.media_url && (
        <div className="bg-zinc-950 border-y border-zinc-900 p-4">
          <img
            src={post.media_url}
            alt={post.headline}
            className="w-full h-48 iphone:h-56 object-contain rounded-2xl bg-black/60 border border-zinc-800 p-2 shadow-inner"
          />
        </div>
      )}

      <div className="px-4 pt-3.5 space-y-2">
        <h3 className="text-sm iphone:text-[15px] font-bold text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-violet-400 shrink-0" />
          <span>{post.headline}</span>
        </h3>
        <p className="text-xs iphone:text-sm text-zinc-300 leading-relaxed">{post.caption}</p>
      </div>
    </article>
  );
};
