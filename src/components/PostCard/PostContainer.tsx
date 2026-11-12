import React from 'react';
import { Heart, Bookmark, CheckCircle, BookOpen, Share2 } from 'lucide-react';
import type { Persona, StudyPost } from '../../types/post';
import { FlashcardPost } from './FlashcardPost';
import { InfographicPost } from './InfographicPost';
import { VideoReelPost } from './VideoReelPost';

interface PostContainerProps {
  post: StudyPost;
  persona?: Persona;
  isSeen: boolean;
  isLiked: boolean;
  isBookmarked: boolean;
  onMarkSeen: (id: string) => void;
  onToggleLike: (id: string) => void;
  onToggleBookmark: (id: string) => void;
}

export const PostContainer: React.FC<PostContainerProps> = ({
  post,
  persona,
  isSeen,
  isLiked,
  isBookmarked,
  onMarkSeen,
  onToggleLike,
  onToggleBookmark,
}) => {
  const handleInteract = () => {
    if (!isSeen) {
      onMarkSeen(post.id);
    }
  };

  return (
    <article
      onDoubleClick={() => {
        handleInteract();
        onToggleLike(post.id);
      }}
      className="border-b border-zinc-900 bg-black pb-7 pt-1"
    >
      {/* Instagram Header with Avatar, Handle, Location/Source */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full bg-gradient-to-tr ${
              persona?.avatar_color ?? 'from-sky-500 to-blue-700'
            } p-[2px] flex items-center justify-center shadow-sm`}
          >
            <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center font-bold text-xs text-white">
              {persona?.avatar_initials ?? 'PS'}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs iphone:text-sm font-bold text-white tracking-tight">
                {persona?.handle ?? post.persona_id}
              </span>
              <CheckCircle className="w-3.5 h-3.5 text-sky-400 fill-sky-400/20" />
            </div>
            <p className="text-[11px] text-zinc-400 flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-zinc-500 shrink-0" />
              <span className="truncate max-w-[210px] iphone:max-w-[260px]">
                {post.source.book} • {post.source.pages}
              </span>
            </p>
          </div>
        </div>

        <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300">
          {persona?.section_name ?? post.section_id}
        </span>
      </div>

      {/* Main Study Card Element */}
      {(post.format === 'flashcard_flip' ||
        post.format === 'flashcard_carousel') && (
        <FlashcardPost post={post} onInteract={handleInteract} />
      )}
      {post.format === 'infographic' && (
        <InfographicPost post={post} onInteract={handleInteract} />
      )}
      {post.format === 'short_video' && (
        <VideoReelPost post={post} onInteract={handleInteract} />
      )}

      {/* Instagram Action Row (Like, Bookmark, Quick Info) */}
      <div className="px-4 pt-3.5 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={() => {
              handleInteract();
              onToggleLike(post.id);
            }}
            aria-label="Dominado"
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200 active:scale-90 transition"
          >
            <Heart
              className={`w-6 h-6 transition-all duration-200 ${
                isLiked
                  ? 'text-rose-500 fill-rose-500 scale-110 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]'
                  : 'text-zinc-200 hover:text-white'
              }`}
            />
            <span className="text-xs">{isLiked ? 'Dominado' : 'Dominar'}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            handleInteract();
            onToggleBookmark(post.id);
          }}
          aria-label="Salvar para revisão"
          className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200 active:scale-90 transition"
        >
          <Bookmark
            className={`w-6 h-6 transition-all duration-200 ${
              isBookmarked
                ? 'text-amber-400 fill-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                : 'text-zinc-200 hover:text-white'
            }`}
          />
          <span className="text-xs">{isBookmarked ? 'Na Revisão' : 'Revisar +'}</span>
        </button>
      </div>

      {/* Caption, Persona Info & Tags */}
      <div className="px-4 pt-3 space-y-1.5">
        <p className="text-xs iphone:text-[13px] text-zinc-200 leading-relaxed">
          <strong className="font-bold text-white mr-1.5">
            {persona?.handle ?? post.persona_id}
          </strong>
          {post.caption}
        </p>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {post.tags.map((tag) => (
            <span key={tag} className="text-[11px] font-medium text-sky-400/90 hover:underline cursor-pointer">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
};
