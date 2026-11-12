import React from 'react';
import { RefreshCw, X, Sparkles } from 'lucide-react';
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
    <div className="min-h-screen bg-black text-zinc-100 flex justify-center">
      <div className="w-full max-w-md min-h-screen bg-black border-x border-zinc-900 pb-28">
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
          <div className="mx-4 my-3 p-3.5 rounded-2xl bg-zinc-900/90 border border-sky-500/40 text-xs text-sky-200 flex items-center justify-between gap-2 shadow-lg">
            <span className="leading-relaxed">{loopBanner}</span>
            <button
              type="button"
              onClick={dismissBanner}
              aria-label="Fechar aviso"
              className="text-sky-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <main className="divide-y divide-zinc-900">
          {posts.length === 0 ? (
            <div className="p-12 text-center space-y-4">
              <p className="text-sm text-zinc-400">
                Nenhum post disponível para este filtro.
              </p>
              <button
                type="button"
                onClick={() => setSectionFilter('all')}
                className="px-5 py-2.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-semibold text-white hover:bg-zinc-800 transition"
              >
                Voltar para o Feed Principal
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

        {/* End of Timeline Instagram-style catch-up card */}
        <footer className="p-6 text-center space-y-4 border-t border-zinc-900 bg-zinc-950/60 mt-4 rounded-3xl mx-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 p-[2px] flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-sky-400" />
            </div>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Você está em dia com este ciclo!</h4>
            <p className="text-xs text-zinc-400 mt-1">
              Ciclo #{cycleCount} finalizado. Clique abaixo para reembaralhar o deck ou solicitar novos posts.
            </p>
          </div>
          <button
            type="button"
            onClick={completeAndLoopTimeline}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition"
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
