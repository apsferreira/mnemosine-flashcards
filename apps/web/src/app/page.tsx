'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listDecks, createDeck } from '@/services/decks';
import type { Deck } from '@mnemosine/core';

export default function HomePage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: '', description: '' });
  const [showForm, setShowForm] = useState(false);

  const { data: decks = [], isLoading, isError } = useQuery({
    queryKey: ['decks'],
    queryFn: listDecks,
  });

  const createMut = useMutation({
    mutationFn: createDeck,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['decks'] });
      setForm({ name: '', description: '' });
      setShowForm(false);
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mnemosine</h1>
          <p className="text-sm text-gray-500">Seus decks de flashcards</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-4 py-2 bg-indigo-500 text-white rounded-xl text-sm font-semibold hover:bg-indigo-600 transition-colors"
        >
          + Novo deck
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={(e) => { e.preventDefault(); if (form.name.trim()) createMut.mutate(form); }}
          className="flex flex-col gap-3 p-4 rounded-2xl border border-gray-200 bg-white"
        >
          <input autoFocus type="text" placeholder="Nome do deck" value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-indigo-400" required />
          <input type="text" placeholder="Descrição (opcional)" value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-indigo-400" />
          <div className="flex gap-2">
            <button type="submit" disabled={createMut.isPending || !form.name.trim()}
              className="flex-1 py-2 bg-indigo-500 text-white rounded-lg text-sm font-semibold disabled:opacity-50">
              {createMut.isPending ? 'Criando...' : 'Criar'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-500">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {isLoading && <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>}
      {isError && <p className="text-red-500 text-sm">Erro ao carregar decks.</p>}
      {!isLoading && decks.length === 0 && <p className="text-gray-400 text-sm text-center py-8">Nenhum deck ainda. Crie o primeiro acima.</p>}

      <div className="flex flex-col gap-3">
        {decks.map((deck: Deck) => (
          <div key={deck.id} className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 bg-white">
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 truncate">{deck.name}</p>
              {deck.description && <p className="text-xs text-gray-400 truncate">{deck.description}</p>}
              <p className="text-xs text-gray-400 mt-0.5">{deck.total_cards} cards</p>
            </div>
            <div className="flex flex-col items-end gap-1 ml-4 shrink-0">
              {deck.due_cards > 0 && (
                <span className="text-xs font-semibold text-indigo-500">{deck.due_cards} pendente{deck.due_cards !== 1 ? 's' : ''}</span>
              )}
              <button onClick={() => router.push(`/study/${deck.id}`)}
                className="px-3 py-1.5 bg-indigo-500 text-white rounded-lg text-xs font-semibold hover:bg-indigo-600 transition-colors">
                Estudar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
