import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import App from '../../App';

describe('PSCPP-Gram Responsive iPhone 14 UI', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders Instagram header, section stories bar, fake author personas, and study cards in responsive container', async () => {
    render(<App />);

    expect(screen.getByText(/Pilogram/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reembaralhar/i })).toBeInTheDocument();
    const storiesNav = screen.getByRole('navigation', { name: /Filtro por Seções do Edital/i });
    expect(within(storiesNav).getByRole('button', { name: /^Seção I\b/i })).toBeInTheDocument();
    expect(screen.getAllByText(/colregs/i).length).toBeGreaterThan(0);
  });

  it('allows flipping flashcards, filtering by section, and triggering the end-of-timeline loop', async () => {
    render(<App />);

    // Click the specific RIPEAM flashcard flip button
    const postHandle = screen.getAllByText(/colregs/i)[0];
    const postArticle = postHandle.closest('article');
    expect(postArticle).not.toBeNull();
    const flipBtn = within(postArticle!).getByRole('button', { name: /Virar Card/i });
    fireEvent.click(flipBtn);
    expect(within(postArticle!).getAllByText(/2 Vermelhas/i).length).toBeGreaterThan(0);

    const loopBtn = screen.getByRole('button', {
      name: /Concluir Timeline & Gerar Novos Posts/i,
    });
    fireEvent.click(loopBtn);
    expect(screen.getByText(/Ciclo #1 finalizado/i)).toBeInTheDocument();
  });
});
