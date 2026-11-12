import React from 'react';
import { RefreshCw, X } from 'lucide-react';
import { useTimeline } from './hooks/useTimeline';
import { Header } from './components/Header';
import { StoriesBar } from './components/StoriesBar';
import { PostContainer } from './components/PostCard/PostContainer';
import { ExternalSocialPost } from './components/PostCard/ExternalSocialPost';
import { BottomNav } from './components/BottomNav';

export const App: React.FC = () => {
  const {
    posts,
    personas,
    sectionFilter,
    setSectionFilter,
    serverState,
    loopBanner,
    dismissBanner,
    seenIds,
    bookmarkedIds,
    likedIds,
    cycleCount,
    totalStudyPosts,
    markSeen,
    toggleBookmark,
    toggleLike,
    shuffleTimeline,
    completeAndLoopTimeline,
  } = useTimeline();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex justify-center">
      <div className="w-full max-w-md min-h-screen bg-black border-x border-zinc-900 pb-24">
        <Header
          cycleCount={cycleCount}
          seenCount={seenIds.length}
          totalStudyPosts={totalStudyPosts}
          needsGeneration={serverState.needs_generation}
          onShuffle={shuffleTimeline}
        />

        <StoriesBar
          activeFilter={sectionFilter}
          onSelectFilter={setSectionFilter}
          bookmarkedCount={bookmarkedIds.length}
        />

        {loopBanner && (
          <div className="mx-3 my-2.5 p-3 rounded-xl bg-sky-950/80 border border-sky-500/40 text-xs text-sky-200 flex items-center justify-between gap-2">
            <span>{loopBanner}</span>
            <button
              type="button"
              onClick={dismissBanner}
              aria-label="Fechar aviso"
              className="text-sky-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <main className="divide-y divide-zinc-900">
          {posts.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <p className="text-sm text-zinc-400">
                Nenhum post salvo nesta aba ainda.
              </p>
              <button
                type="button"
                onClick={() => setSectionFilter('all')}
                className="px-4 py-2 rounded-full bg-zinc-800 text-xs font-semibold text-white"
              >
                Voltar para o Feed Completo
              </button>
            </div>
          ) : (
            posts.map((post) =>
              post.is_external ? (
                <ExternalSocialPost key={post.id} post={post} />
              ) : (
                <PostContainer
                  key={post.id}
                  post={post}
                  persona={personas[post.persona_id]}
                  isSeen={seenIds.includes(post.id)}
                  isLiked={likedIds.includes(post.id)}
                  isBookmarked={bookmarkedIds.includes(post.id)}
                  onMarkSeen={markSeen}
                  onToggleLike={toggleLike}
                  onToggleBookmark={toggleBookmark}
                />
              )
            )
          )}
        </main>

        {/* End of Timeline Loop Trigger Footer */}
        <footer className="p-6 text-center space-y-3 border-t border-zinc-900">
          <p className="text-xs text-zinc-400">
            Você chegou ao fim deste bloco da timeline (Ciclo #{cycleCount}).
          </p>
          <button
            type="button"
            onClick={completeAndLoopTimeline}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg active:scale-[0.99] transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Concluir Timeline & Gerar Novos Posts</span>
          </button>
        </footer>

        <BottomNav
          activeFilter={sectionFilter}
          bookmarkedCount={bookmarkedIds.length}
          onSelectFilter={setSectionFilter}
          onShuffle={shuffleTimeline}
          onLoopNow={completeAndLoopTimeline}
        />
      </div>
    </div>
  );
};

export default App;
