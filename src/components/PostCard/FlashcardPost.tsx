import React, { useState } from 'react';
import { RotateCw, ChevronLeft, ChevronRight, Lightbulb } from 'lucide-react';
import type { StudyPost } from '../../types/post';

interface FlashcardPostProps {
  post: StudyPost;
  onInteract: () => void;
}

export const FlashcardPost: React.FC<FlashcardPostProps> = ({
  post,
  onInteract,
}) => {
  const [slideIdx, setSlideIdx] = useState(0);
  const slides = post.slides;
  const current = slides[slideIdx] ?? slides[0];

  const handleFlipOrNext = () => {
    onInteract();
    setSlideIdx((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    onInteract();
    setSlideIdx((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative bg-zinc-950 border-y border-zinc-900 p-5 iphone:p-6 min-h-[380px] flex flex-col justify-between select-none">
      {/* Top category label & slide pill */}
      <div className="flex items-center justify-between text-xs text-zinc-400 mb-4">
        <span className="uppercase tracking-widest font-bold text-sky-400 text-[10px] iphone:text-[11px] bg-sky-500/10 px-2.5 py-1 rounded-md border border-sky-500/20">
          {post.format === 'flashcard_flip' ? 'Flashcard Interativo' : 'Carrossel de Conteúdo'}
        </span>
        <span className="text-[11px] font-medium bg-zinc-900/80 px-2 py-0.5 rounded-full text-zinc-300">
          {slideIdx + 1} / {slides.length}
        </span>
      </div>

      {/* Main Flashcard Content Area */}
      <div className="my-auto space-y-4">
        <h3 className="text-base iphone:text-lg font-bold text-white leading-snug tracking-tight">
          {current.title}
        </h3>

        {current.media_url && (
          <div className="rounded-2xl overflow-hidden bg-black/60 border border-zinc-800/80 p-3 shadow-inner">
            <img
              src={current.media_url}
              alt={current.title}
              className="w-full h-44 iphone:h-52 object-contain"
            />
          </div>
        )}

        {current.prompt && (
          <div className="text-sm iphone:text-[15px] text-zinc-100 leading-relaxed bg-zinc-900/90 p-4 rounded-2xl border border-zinc-800 shadow-sm">
            {current.prompt}
          </div>
        )}

        {current.body && (
          <div className="text-sm iphone:text-[15px] text-emerald-100 leading-relaxed bg-emerald-950/40 p-4 rounded-2xl border border-emerald-800/60 whitespace-pre-line shadow-sm">
            {current.body}
          </div>
        )}

        {current.exam_tip && (
          <div className="flex items-start gap-2.5 text-xs iphone:text-sm text-amber-200 bg-amber-950/40 border border-amber-700/60 rounded-2xl p-3.5 shadow-sm">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              <strong className="text-amber-300 font-semibold">Foco de Prova:</strong> {current.exam_tip}
            </span>
          </div>
        )}
      </div>

      {/* Card Action Controls */}
      <div className="mt-5 pt-3.5 border-t border-zinc-800/80 flex items-center justify-between">
        {slides.length > 1 && post.format === 'flashcard_carousel' ? (
          <div className="flex items-center gap-2 w-full justify-between">
            <button
              type="button"
              onClick={handlePrev}
              className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-zinc-200 flex items-center gap-1 active:scale-95 transition"
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </button>
            <div className="flex gap-1.5 items-center">
              {slides.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-200 ${
                    idx === slideIdx ? 'w-5 bg-sky-400' : 'w-1.5 bg-zinc-700'
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={handleFlipOrNext}
              aria-label="Virar Card"
              className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-xs font-bold text-black flex items-center gap-1 active:scale-95 transition shadow-sm"
            >
              Próximo <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleFlipOrNext}
            aria-label="Virar Card"
            className="w-full py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800/90 border border-zinc-800 text-sky-400 text-xs font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-sm"
          >
            <RotateCw className="w-4 h-4" />
            <span>
              {slideIdx === 0 ? 'Virar Card (Ver Resposta)' : 'Voltar para Pergunta'}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
