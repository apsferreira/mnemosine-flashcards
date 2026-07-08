"use client";

/**
 * Home page — deck list
 *
 * 'use client' is required here because this component uses hooks.
 * Without it, Next.js runs this on the server where hooks don't exist.
 */

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/components/Modal/Modal";
import { listDecks, createDeck, updateDeck, deleteDeck } from "@/services/decks";
import type { Deck } from "@mnemosine/core";

// ─── Types ────────────────────────────────────────────────────────────────────

type DeckForm = { name: string; description: string };

const EMPTY_FORM: DeckForm = { name: "", description: "" };

// ─── Component ────────────────────────────────────────────────────────────────

export default function HomePage() {
  // useRouter — navigate between pages without a full browser reload.
  // Equivalent to <Link> but usable inside event handlers.
  const router = useRouter();

  // useQueryClient — gives us access to the query cache.
  // We use it to mark data as stale (invalidate) so the list re-fetches
  // after a create, update, or delete.
  const qc = useQueryClient();

  // useState — three independent pieces of UI state:
  //   showCreate  → whether the "New deck" modal is open
  //   editingDeck → which deck is being edited (null = modal closed)
  //   deletingId  → which deck the user is about to delete (null = no confirmation)
  const [showCreate, setShowCreate] = useState(false);
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // useState — controlled form for both create and edit modals.
  // "Controlled" means the input value is always driven by React state,
  // not stored in the DOM. onChange updates state → React re-renders → input shows new value.
  const [form, setForm] = useState<DeckForm>(EMPTY_FORM);

  // useQuery — fetches data and manages loading/error/cache automatically.
  // queryKey: ['decks'] is the cache identifier. invalidateQueries(['decks'])
  // will trigger a refetch of exactly this query.
  const { data: decks = [], isLoading, isError } = useQuery({
    queryKey: ["decks"],
    queryFn: listDecks,
  });

  // useMutation — for actions that change data (POST/PATCH/DELETE).
  // Unlike useQuery, mutations don't run automatically — you call .mutate().
  // onSuccess runs after the server responds OK.
  const createMut = useMutation({
    mutationFn: createDeck,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["decks"] }); // refresh the list
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

  // useCallback — memoizes functions so they don't re-create on every render.
  // This matters when you pass them as props to child components (like Modal's onClose),
  // because a new function reference would cause an unnecessary re-render.
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

  function handleCreateSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); // prevent browser from reloading the page
    if (form.name.trim()) createMut.mutate(form);
  }

  function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingDeck || !form.name.trim()) return;
    updateMut.mutate({ id: editingDeck.id, ...form });
  }

  // ─── Shared form fields (used in both create and edit modals) ────────────────

  function DeckFormFields({ isPending }: { isPending: boolean }) {
    return (
      <>
        <input
          autoFocus
          type="text"
          placeholder="Deck name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-indigo-400"
          required
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-indigo-400"
        />
        <button
          type="submit"
          disabled={isPending || !form.name.trim()}
          className="w-full py-2 bg-indigo-500 text-white rounded-lg text-sm font-semibold disabled:opacity-50 hover:bg-indigo-600 transition-colors"
        >
          {isPending ? "Saving..." : "Save"}
        </button>
      </>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mnemosine</h1>
          <p className="text-sm text-gray-500">Your flashcard decks</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-indigo-500 text-white rounded-xl text-sm font-semibold hover:bg-indigo-600 transition-colors"
        >
          + New deck
        </button>
      </div>

      {/* Create modal */}
      <Modal open={showCreate} onClose={closeCreate} title="New deck">
        <form onSubmit={handleCreateSubmit} className="flex flex-col gap-3">
          <DeckFormFields isPending={createMut.isPending} />
        </form>
      </Modal>

      {/* Edit modal */}
      <Modal open={!!editingDeck} onClose={closeEdit} title="Edit deck">
        <form onSubmit={handleEditSubmit} className="flex flex-col gap-3">
          <DeckFormFields isPending={updateMut.isPending} />
        </form>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        open={!!deletingId}
        onClose={() => setDeletingId(null)}
        title="Delete deck?"
      >
        <p className="text-sm text-gray-500">
          This will permanently delete the deck and all its cards. This cannot be undone.
        </p>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => deletingId && deleteMut.mutate(deletingId)}
            disabled={deleteMut.isPending}
            className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold disabled:opacity-50 hover:bg-red-600 transition-colors"
          >
            {deleteMut.isPending ? "Deleting..." : "Delete"}
          </button>
          <button
            onClick={() => setDeletingId(null)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </Modal>

      {/* Loading / error / empty states */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {isError && <p className="text-red-500 text-sm">Failed to load decks.</p>}
      {!isLoading && decks.length === 0 && (
        <p className="text-gray-400 text-sm text-center py-8">
          No decks yet. Create your first one above.
        </p>
      )}

      {/* Deck list */}
      <div className="flex flex-col gap-3">
        {decks.map((deck: Deck) => (
          <div
            key={deck.id}
            className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 bg-white"
          >
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 truncate">{deck.name}</p>
              {deck.description && (
                <p className="text-xs text-gray-400 truncate">{deck.description}</p>
              )}
              <p className="text-xs text-gray-400 mt-0.5">
                {deck.total_cards} cards · {deck.due_cards} due today
              </p>
            </div>

            <div className="flex items-center gap-2 ml-4 shrink-0">
              {deck.due_cards > 0 && (
                <span className="text-xs font-semibold text-indigo-500">
                  {deck.due_cards} due
                </span>
              )}
              <button
                onClick={() => router.push(`/study/${deck.id}`)}
                className="px-3 py-1.5 bg-indigo-500 text-white rounded-lg text-xs font-semibold hover:bg-indigo-600 transition-colors"
              >
                Study
              </button>
              <button
                onClick={() => router.push(`/decks/${deck.id}`)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Manage
              </button>
              <button
                onClick={() => openEdit(deck)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => setDeletingId(deck.id)}
                className="px-3 py-1.5 border border-red-200 rounded-lg text-xs text-red-500 hover:bg-red-50 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
