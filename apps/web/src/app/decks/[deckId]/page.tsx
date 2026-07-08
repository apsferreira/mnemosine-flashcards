"use client";

import { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/components/Modal/Modal";
import { listCards, createCard } from "@/services/cards";
import type { Card } from "@mnemosine/core";

type CardForm = { front: string; back: string };
const EMPTY_FORM: CardForm = { front: "", back: "" };

const STATE_LABELS: Record<number, { label: string; color: string }> = {
  0: { label: "New", color: "text-slate-400 dark:text-slate-500" },
  1: { label: "Learning", color: "text-amber-500 dark:text-amber-400" },
  2: { label: "Review", color: "text-emerald-500 dark:text-emerald-400" },
  3: { label: "Relearning", color: "text-rose-400 dark:text-rose-400" },
};

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

  function handleSubmit() {
    if (form.front.trim() && form.back.trim()) createMut.mutate(form);
  }

  return (
    <div className="flex flex-col gap-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
            aria-label="Back"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Manage cards
            </h1>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
              {cards.length} {cards.length === 1 ? "card" : "cards"} in this deck
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-indigo-500 text-white rounded-xl text-sm font-semibold hover:bg-indigo-600 active:bg-indigo-700 transition-colors cursor-pointer shadow-sm shadow-indigo-100 dark:shadow-indigo-900/30"
        >
          + Add card
        </button>
      </div>

      {/* Add card modal */}
      <Modal open={showCreate} onClose={closeCreate} title="New card">
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Front
            </label>
            <textarea
              autoFocus
              rows={3}
              placeholder="Question or concept…"
              value={form.front}
              onChange={(e) => setForm((f) => ({ ...f, front: e.target.value }))}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 resize-none transition-colors"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Back
            </label>
            <textarea
              rows={3}
              placeholder="Answer or explanation…"
              value={form.back}
              onChange={(e) => setForm((f) => ({ ...f, back: e.target.value }))}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 resize-none transition-colors"
              required
            />
          </div>
          <button
            type="submit"
            disabled={createMut.isPending || !form.front.trim() || !form.back.trim()}
            className="w-full py-2.5 bg-indigo-500 text-white rounded-xl text-sm font-semibold disabled:opacity-50 hover:bg-indigo-600 active:bg-indigo-700 transition-colors cursor-pointer"
          >
            {createMut.isPending ? "Saving…" : "Save card"}
          </button>
        </form>
      </Modal>

      {/* Loading / error / empty states */}
      {isLoading && (
        <div className="flex justify-center py-16">
          <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {isError && (
        <p className="text-red-500 text-sm text-center py-4">Failed to load cards.</p>
      )}
      {!isLoading && cards.length === 0 && (
        <div className="text-center py-16">
          <p className="text-slate-400 dark:text-slate-500 text-sm">
            No cards yet.{" "}
            <button
              onClick={() => setShowCreate(true)}
              className="text-indigo-500 hover:text-indigo-600 font-medium cursor-pointer"
            >
              Add your first one.
            </button>
          </p>
        </div>
      )}

      {/* Card list */}
      <div className="flex flex-col gap-3">
        {cards.map((card: Card) => {
          const stateInfo = STATE_LABELS[card.state] ?? STATE_LABELS[0];
          return (
            <div
              key={card.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 shadow-sm flex flex-col gap-3"
            >
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-relaxed">
                  {card.front}
                </p>
                <div className="h-px bg-slate-100 dark:bg-slate-700" />
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {card.back}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium ${stateInfo.color}`}>
                  {stateInfo.label}
                </span>
                <span className="text-xs text-slate-200 dark:text-slate-700">·</span>
                <span className="text-xs text-slate-300 dark:text-slate-600">
                  {card.reps} {card.reps === 1 ? "rep" : "reps"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
