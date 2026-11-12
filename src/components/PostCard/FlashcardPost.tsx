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
    <div className="relative bg-gradient-to-b from-zinc-900 to-zinc-950 border-y border-zinc-800/80 p-4 iphone:p-5 min-h-[320px] flex flex-col justify-between">
      <div className="flex items-center justify-between text-xs text-zinc-400 mb-3">
        <span className="uppercase tracking-wider font-semibold text-sky-400 text-[11px] iphone:text-xs">
          {post.format === 'flashcard_flip' ? 'Flashcard 3D' : 'Carrossel de Estudo'}
        </span>
        <span>
          {slideIdx + 1} / {slides.length}
        </span>
      </div>

      <div className="my-auto space-y-3">
        <h3 className="text-sm iphone:text-base font-bold text-white leading-snug">
          {current.title}
        </h3>

        {current.media_url && (
          <img
            src={current.media_url}
            alt={current.title}
            className="w-full h-40 iphone:h-44 object-contain rounded-xl bg-zinc-950 border border-zinc-800 p-2"
          />
        )}

        {current.prompt && (
          <p className="text-xs iphone:text-sm text-zinc-200 leading-relaxed bg-zinc-950/70 p-3.5 rounded-xl border border-zinc-800">
            {current.prompt}
          </p>
        )}

        {current.body && (
          <p className="text-xs iphone:text-sm text-emerald-100 leading-relaxed bg-emerald-950/30 p-3.5 rounded-xl border border-emerald-800/50 whitespace-pre-line">
            {current.body}
          </p>
        )}

        {current.exam_tip && (
          <div className="flex items-start gap-2 text-[11px] iphone:text-xs text-amber-200 bg-amber-950/40 border border-amber-700/50 rounded-xl p-3">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Foco de Prova:</strong> {current.exam_tip}
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
        {slides.length > 1 && post.format === 'flashcard_carousel' ? (
          <div className="flex items-center gap-2 w-full justify-between">
            <button
              type="button"
              onClick={handlePrev}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 text-xs font-medium text-zinc-200 flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </button>
            <div className="flex gap-1.5">
              {slides.map((_, idx) => (
                <span
                  key={idx}
                  className={`w-2 h-2 rounded-full ${
                    idx === slideIdx ? 'bg-sky-400' : 'bg-zinc-700'
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={handleFlipOrNext}
              aria-label="Virar Card"
              className="px-3 py-1.5 rounded-lg bg-sky-500 text-xs font-bold text-black flex items-center gap-1"
            >
              Próximo <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleFlipOrNext}
            aria-label="Virar Card"
            className="w-full py-2.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 text-xs font-bold flex items-center justify-center gap-2 active:scale-[0.99] transition"
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
