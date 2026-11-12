import React from 'react';
import { Heart, Bookmark, CheckCircle, BookOpen } from 'lucide-react';
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
      className="border-b border-zinc-900 bg-black pb-4"
    >
      {/* Author Fake Account Header */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 iphone:w-9 iphone:h-9 rounded-full bg-gradient-to-tr ${
              persona?.avatar_color ?? 'from-sky-500 to-blue-700'
            } flex items-center justify-center font-bold text-xs text-white`}
          >
            {persona?.avatar_initials ?? 'PS'}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-white">
                {persona?.handle ?? post.persona_id}
              </span>
              <CheckCircle className="w-3.5 h-3.5 text-sky-400 fill-sky-400/20" />
            </div>
            <p className="text-[10px] iphone:text-[11px] text-zinc-400 flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-zinc-500" />
              <span>
                {post.source.book} • {post.source.pages}
              </span>
            </p>
          </div>
        </div>
        <span className="text-[9px] iphone:text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300">
          {persona?.section_name ?? post.section_id}
        </span>
      </div>

      {/* Media / Interactive Card Body */}
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

      {/* Instagram Action Bar */}
      <div className="px-4 pt-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => {
              handleInteract();
              onToggleLike(post.id);
            }}
            aria-label="Dominado"
            className="flex items-center gap-1.5 text-xs font-medium text-zinc-200"
          >
            <Heart
              className={`w-5 h-5 iphone:w-6 iphone:h-6 transition ${
                isLiked ? 'text-rose-500 fill-rose-500 scale-110' : 'text-zinc-200'
              }`}
            />
            <span className="text-[11px] iphone:text-xs">{isLiked ? 'Dominado' : 'Marcar Dominado'}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            handleInteract();
            onToggleBookmark(post.id);
          }}
          aria-label="Salvar para revisão"
          className="flex items-center gap-1.5 text-xs font-medium text-zinc-200"
        >
          <Bookmark
            className={`w-5 h-5 iphone:w-6 iphone:h-6 transition ${
              isBookmarked
                ? 'text-amber-400 fill-amber-400 scale-110'
                : 'text-zinc-200'
            }`}
          />
          <span className="text-[11px] iphone:text-xs">{isBookmarked ? 'Na Revisão' : 'Revisar +'}</span>
        </button>
      </div>

      {/* Caption & Source Metadata */}
      <div className="px-4 pt-2.5 space-y-1">
        <p className="text-xs text-zinc-200 leading-relaxed">
          <strong className="font-bold text-white mr-1.5">
            {persona?.handle ?? post.persona_id}
          </strong>
          {post.caption}
        </p>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {post.tags.map((tag) => (
            <span key={tag} className="text-[10px] iphone:text-[11px] text-sky-400">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
};
