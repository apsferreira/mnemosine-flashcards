"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/components/Modal/Modal";
import { listDecks, createDeck, updateDeck, deleteDeck } from "@/services/decks";
import type { Deck } from "@mnemosine/core";

// ─── Types ────────────────────────────────────────────────────────────────────

type DeckForm = { name: string; description: string };

const EMPTY_FORM: DeckForm = { name: "", description: "" };

// ─── Icons ────────────────────────────────────────────────────────────────────

function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const router = useRouter();
  const qc = useQueryClient();

  const [showCreate, setShowCreate] = useState(false);
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState<DeckForm>(EMPTY_FORM);

  const { data: decks = [], isLoading, isError } = useQuery({
    queryKey: ["decks"],
    queryFn: listDecks,
  });

  const createMut = useMutation({
    mutationFn: createDeck,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["decks"] });
      closeCreate();
    },
  });

  const updateMut = useMutation({
    mutationFn: updateDeck,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["decks"] });
      closeEdit();
    },
  });

  const deleteMut = useMutation({
    mutationFn: deleteDeck,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["decks"] });
      setDeletingId(null);
    },
  });

  const closeCreate = useCallback(() => {
    setShowCreate(false);
    setForm(EMPTY_FORM);
  }, []);

  const closeEdit = useCallback(() => {
    setEditingDeck(null);
    setForm(EMPTY_FORM);
  }, []);

  const openEdit = useCallback((deck: Deck) => {
    setEditingDeck(deck);
    setForm({ name: deck.name, description: deck.description ?? "" });
  }, []);

  // ─── Handlers ────────────────────────────────────────────────────────────────

  function handleCreateSubmit() {
    if (form.name.trim()) createMut.mutate(form);
  }

  function handleEditSubmit() {
    if (!editingDeck || !form.name.trim()) return;
    updateMut.mutate({ id: editingDeck.id, ...form });
  }

  // ─── Shared form fields ───────────────────────────────────────────────────────

  function DeckFormFields({ isPending }: { isPending: boolean }) {
    return (
      <>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Name
          </label>
          <input
            autoFocus
            type="text"
            placeholder="e.g. TypeScript, Biology, Economics"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 transition-colors"
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Description{" "}
            <span className="normal-case font-normal text-slate-300 dark:text-slate-600">
              (optional)
            </span>
          </label>
          <input
            type="text"
            placeholder="What's this deck about?"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={isPending || !form.name.trim()}
          className="w-full py-2.5 bg-indigo-500 text-white rounded-xl text-sm font-semibold disabled:opacity-50 hover:bg-indigo-600 active:bg-indigo-700 transition-colors cursor-pointer"
        >
          {isPending ? "Saving…" : "Save"}
        </button>
      </>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Mnemosine
          </h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
            Your flashcard decks
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-indigo-500 text-white rounded-xl text-sm font-semibold hover:bg-indigo-600 active:bg-indigo-700 transition-colors cursor-pointer shadow-sm shadow-indigo-200 dark:shadow-indigo-900/40"
        >
          + New deck
        </button>
      </div>

      {/* Create modal */}
      <Modal open={showCreate} onClose={closeCreate} title="New deck">
        <form action={handleCreateSubmit} className="flex flex-col gap-4">
          <DeckFormFields isPending={createMut.isPending} />
        </form>
      </Modal>

      {/* Edit modal */}
      <Modal open={!!editingDeck} onClose={closeEdit} title="Edit deck">
        <form action={handleEditSubmit} className="flex flex-col gap-4">
          <DeckFormFields isPending={updateMut.isPending} />
        </form>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal open={!!deletingId} onClose={() => setDeletingId(null)} title="Delete deck?">
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          This will permanently delete the deck and all its cards. This action cannot be undone.
        </p>
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => deletingId && deleteMut.mutate(deletingId)}
            disabled={deleteMut.isPending}
            className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold disabled:opacity-50 hover:bg-red-600 active:bg-red-700 transition-colors cursor-pointer"
          >
            {deleteMut.isPending ? "Deleting…" : "Delete"}
          </button>
          <button
            onClick={() => setDeletingId(null)}
            className="px-5 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </Modal>

      {/* Loading / error / empty states */}
      {isLoading && (
        <div className="flex justify-center py-16">
          <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {isError && (
        <p className="text-red-500 text-sm text-center py-4">Failed to load decks.</p>
      )}
      {!isLoading && decks.length === 0 && (
        <div className="text-center py-16">
          <p className="text-slate-400 dark:text-slate-500 text-sm">
            No decks yet.{" "}
            <button
              onClick={() => setShowCreate(true)}
              className="text-indigo-500 hover:text-indigo-600 font-medium cursor-pointer"
            >
              Create your first one.
            </button>
          </p>
        </div>
      )}

      {/* Deck list */}
      <div className="flex flex-col gap-3">
        {decks.map((deck: Deck) => (
          <div
            key={deck.id}
            className="group relative flex items-center justify-between p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 shadow-sm hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-800/60 transition-all duration-200"
          >
            {/* Left accent on hover */}
            <div className="absolute left-0 top-5 bottom-5 w-0.5 rounded-full bg-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

            <div className="min-w-0 pl-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                  {deck.name}
                </p>
                {deck.due_cards > 0 && (
                  <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                    {deck.due_cards} due
                  </span>
                )}
              </div>
              {deck.description && (
                <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">
                  {deck.description}
                </p>
              )}
              <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">
                {deck.total_cards} {deck.total_cards === 1 ? "card" : "cards"}
              </p>
            </div>

            <div className="flex items-center gap-1.5 ml-4 shrink-0">
              <button
                onClick={() => router.push(`/study/${deck.id}`)}
                className="px-4 py-2 bg-indigo-500 text-white rounded-xl text-xs font-semibold hover:bg-indigo-600 active:bg-indigo-700 transition-colors cursor-pointer shadow-sm shadow-indigo-100 dark:shadow-indigo-900/30"
              >
                Study
              </button>
              <button
                onClick={() => router.push(`/decks/${deck.id}`)}
                className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Manage
              </button>
              <button
                onClick={() => openEdit(deck)}
                className="w-8 h-8 flex items-center justify-center text-slate-300 dark:text-slate-600 rounded-lg hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
                aria-label={`Edit ${deck.name}`}
              >
                <PencilIcon />
              </button>
              <button
                onClick={() => setDeletingId(deck.id)}
                className="w-8 h-8 flex items-center justify-center text-slate-300 dark:text-slate-600 rounded-lg hover:text-red-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                aria-label={`Delete ${deck.name}`}
              >
                <TrashIcon />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
