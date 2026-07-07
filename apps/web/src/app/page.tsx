"use client";

/**
 * Home page — deck list
 *
 * 'use client' is required here because this component uses:
 *   - useState  → to toggle the create form
 *   - useQuery  → to fetch decks (uses React context internally)
 *   - useRouter → to navigate to the study page
 *
 * Without 'use client', Next.js runs this on the server where
 * none of those hooks are available.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listDecks, createDeck } from "@/services/decks";
import type { Deck } from "@mnemosine/core";

export default function HomePage() {
  // useRouter — navigate between pages without a full page reload
  const router = useRouter();

  // useQueryClient — lets us manually invalidate (refetch) cached queries
  const qc = useQueryClient();

  // useState — controls the form fields (controlled inputs)
  const [form, setForm] = useState({ name: "", description: "" });

  // useState — toggles form visibility. false = hidden, true = visible
  const [showForm, setShowForm] = useState(false);

  // useQuery — fetches data and manages loading/error states automatically
  // queryKey: cache identifier. If another component calls useQuery(['decks']),
  //           it gets the same cached data — no duplicate requests.
  const {
    data: decks = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["decks"],
    queryFn: listDecks,         // calls GET /api/decks
  });

  // useMutation — for actions that change data (POST, PUT, DELETE)
  // Unlike useQuery, mutations don't run automatically — you call .mutate()
  const createMut = useMutation({
    mutationFn: createDeck,     // calls POST /api/decks
    onSuccess: () => {
      // Tell React Query the 'decks' cache is stale → triggers a refetch
      void qc.invalidateQueries({ queryKey: ["decks"] });
      setForm({ name: "", description: "" });
      setShowForm(false);
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mnemosine</h1>
          <p className="text-sm text-gray-500">Your flashcard decks</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-4 py-2 bg-indigo-500 text-white rounded-xl text-sm font-semibold hover:bg-indigo-600 transition-colors"
        >
          + New deck
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (form.name.trim()) createMut.mutate(form);
          }}
          className="flex flex-col gap-3 p-4 rounded-2xl border border-gray-200 bg-white"
        >
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
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-indigo-400"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={createMut.isPending || !form.name.trim()}
              className="flex-1 py-2 bg-indigo-500 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
            >
              {createMut.isPending ? "Creating..." : "Create"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {isError && (
        <p className="text-red-500 text-sm">Failed to load decks.</p>
      )}
      {!isLoading && decks.length === 0 && (
        <p className="text-gray-400 text-sm text-center py-8">
          No decks yet. Create your first one above.
        </p>
      )}

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
            <div className="flex flex-col items-end gap-1 ml-4 shrink-0">
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
