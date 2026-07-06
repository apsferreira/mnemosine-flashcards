import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listDecks, createDeck } from '../../services/deckService';

interface CreateDeckFormData {
  name: string;
  description: string;
}

function CreateDeckForm({ onCreated }: { onCreated: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<CreateDeckFormData>({ name: '', description: '' });
  const [open, setOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: createDeck,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['decks'] });
      setForm({ name: '', description: '' });
      setOpen(false);
      onCreated();
    },
  });

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-[#6366f1] text-white rounded-lg text-sm font-semibold hover:bg-[#4f46e5] transition-colors"
        aria-label="Criar novo deck"
      >
        + Novo Deck
      </button>
    );
  }

  return (
    <form
      className="flex flex-col gap-3 p-4 rounded-[var(--radius)] bg-[var(--bg-card)] border border-[var(--border)]"
      onSubmit={(e) => {
        e.preventDefault();
        if (form.name.trim()) {
          mutation.mutate(form);
        }
      }}
      aria-label="Formulário criar novo deck"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="deck-name" className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
          Nome
        </label>
        <input
          id="deck-name"
          type="text"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Ex: Defesa Mestrado"
          className="px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] text-sm placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[#6366f1]"
          required
          autoFocus
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="deck-description" className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
          Descrição
        </label>
        <input
          id="deck-description"
          type="text"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="Opcional"
          className="px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] text-sm placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[#6366f1]"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={mutation.isPending || !form.name.trim()}
          className="flex-1 py-2 bg-[#6366f1] text-white rounded-lg text-sm font-semibold disabled:opacity-50 hover:bg-[#4f46e5] transition-colors"
        >
          {mutation.isPending ? 'Criando...' : 'Criar'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-4 py-2 border border-[var(--border)] text-[var(--text-secondary)] rounded-lg text-sm hover:text-[var(--text-primary)] transition-colors"
        >
          Cancelar
        </button>
      </div>
      {mutation.isError && (
        <p className="text-xs text-[var(--accent-again)]" role="alert">
          {(mutation.error as Error).message}
        </p>
      )}
    </form>
  );
}

export default function DecksPage() {
  const navigate = useNavigate();

  const { data: decks, isLoading, isError } = useQuery({
    queryKey: ['decks'],
    queryFn: listDecks,
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16" aria-busy="true" aria-label="Carregando decks">
        <div className="w-6 h-6 border-2 border-[#6366f1] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className="p-4 rounded-[var(--radius)] bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.25)] text-[var(--accent-again)] text-sm"
        role="alert"
      >
        Erro ao carregar decks.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Decks</h1>
        <CreateDeckForm onCreated={() => {}} />
      </div>

      {!decks || decks.length === 0 ? (
        <p className="text-[var(--text-secondary)] text-sm">
          Nenhum deck ainda. Crie o primeiro acima.
        </p>
      ) : (
        <div className="flex flex-col gap-3" role="list" aria-label="Lista de decks">
          {decks.map((deck) => {
            const dueCount = deck.due_cards ?? deck.stats?.dueToday ?? 0;
            return (
              <div
                key={deck.id}
                className="flex items-center justify-between p-4 rounded-[var(--radius)] bg-[var(--bg-card)] border border-[var(--border)]"
                role="listitem"
              >
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="font-medium text-[var(--text-primary)] truncate">
                    {deck.name}
                  </span>
                  {deck.description && (
                    <span className="text-xs text-[var(--text-secondary)] truncate">
                      {deck.description}
                    </span>
                  )}
                  <div className="flex gap-3 text-xs text-[var(--text-secondary)] mt-0.5">
                    <span>{deck.stats?.mature ?? 0} maduros</span>
                    <span>{(deck.stats?.retentionRate ?? 0).toFixed(0)}% retenção</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 ml-4">
                  {dueCount > 0 && (
                    <span className="text-xs font-semibold text-[#6366f1]">
                      {dueCount} pendente{dueCount !== 1 ? 's' : ''}
                    </span>
                  )}
                  <button
                    onClick={() => navigate(`/study/${deck.id}`)}
                    className="px-3 py-1.5 bg-[#6366f1] text-white rounded-md text-xs font-semibold hover:bg-[#4f46e5] transition-colors"
                    aria-label={`Estudar deck ${deck.name}`}
                  >
                    Estudar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
