"use client";

import { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/components/Modal/Modal";
import { listCards, createCard } from "@/services/cards";
import type { Card } from "@mnemosine/core";

type CardForm = { front: string; back: string };
const EMPTY_FORM: CardForm = { front: "", back: "" };

export default function DeckManagePage() {
  const { deckId } = useParams<{ deckId: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<CardForm>(EMPTY_FORM);

  const { data: cards = [], isLoading, isError } = useQuery({
    queryKey: ["cards", deckId],
    queryFn: () => listCards(deckId),
  });

  const createMut = useMutation({
    mutationFn: (body: CardForm) => createCard(deckId, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["cards", deckId] });
      void qc.invalidateQueries({ queryKey: ["decks"] });
      setShowCreate(false);
      setForm(EMPTY_FORM);
    },
  });

  const closeCreate = useCallback(() => {
    setShowCreate(false);
    setForm(EMPTY_FORM);
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (form.front.trim() && form.back.trim()) createMut.mutate(form);
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors"
            aria-label="Back"
          >
            ←
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage cards</h1>
            <p className="text-sm text-gray-400">{cards.length} cards in this deck</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-indigo-500 text-white rounded-xl text-sm font-semibold hover:bg-indigo-600 transition-colors"
        >
          + Add card
        </button>
      </div>

      {/* Add card modal */}
      <Modal open={showCreate} onClose={closeCreate} title="New card">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <textarea
            autoFocus
            rows={3}
            placeholder="Front (question)"
            value={form.front}
            onChange={(e) => setForm((f) => ({ ...f, front: e.target.value }))}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 resize-none"
            required
          />
          <textarea
            rows={3}
            placeholder="Back (answer)"
            value={form.back}
            onChange={(e) => setForm((f) => ({ ...f, back: e.target.value }))}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 resize-none"
            required
          />
          <button
            type="submit"
            disabled={createMut.isPending || !form.front.trim() || !form.back.trim()}
            className="w-full py-2 bg-indigo-500 text-white rounded-lg text-sm font-semibold disabled:opacity-50 hover:bg-indigo-600 transition-colors"
          >
            {createMut.isPending ? "Saving..." : "Save card"}
          </button>
        </form>
      </Modal>

      {/* Loading / error / empty states */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {isError && <p className="text-red-500 text-sm">Failed to load cards.</p>}
      {!isLoading && cards.length === 0 && (
        <p className="text-gray-400 text-sm text-center py-8">
          No cards yet. Add your first one above.
        </p>
      )}

      {/* Card list */}
      <div className="flex flex-col gap-3">
        {cards.map((card: Card) => (
          <div
            key={card.id}
            className="p-4 rounded-2xl border border-gray-200 bg-white flex flex-col gap-2"
          >
            <p className="text-sm font-semibold text-gray-900">{card.front}</p>
            <p className="text-sm text-gray-500 border-t border-gray-100 pt-2">{card.back}</p>
            <p className="text-xs text-gray-300">
              {card.state === 0 ? "New" : card.state === 1 ? "Learning" : card.state === 2 ? "Review" : "Relearning"}
              {" · "}{card.reps} reps
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
