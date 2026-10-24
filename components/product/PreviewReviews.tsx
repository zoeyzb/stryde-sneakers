"use client";

import { useEffect, useState, type FormEvent } from "react";

type Note = { id: string; rating: number; message: string; createdAt: string };
const keyFor = (handle: string) => `stryde_preview_feedback_${handle}`;

function readNotes(handle: string): Note[] {
  try {
    const value = JSON.parse(window.localStorage.getItem(keyFor(handle)) ?? "[]") as unknown;
    if (!Array.isArray(value)) return [];
    return value.slice(0, 20).filter((n): n is Note =>
      typeof n === "object" && n !== null &&
      typeof n.id === "string" && typeof n.rating === "number" &&
      typeof n.message === "string" && typeof n.createdAt === "string"
    );
  } catch {
    return [];
  }
}

export default function PreviewReviews({ handle }: { handle: string }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const [ready, setReady] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    setNotes(readNotes(handle));
    setReady(true);
  }, [handle]);

  function save(next: Note[]): boolean {
    try {
      window.localStorage.setItem(keyFor(handle), JSON.stringify(next));
      setNotes(next);
      setFeedback("");
      return true;
    } catch {
      setFeedback("Your browser could not save this note. Please try again.");
      return false;
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = message.trim();
    if (value.length < 10) {
      setFeedback("Write at least 10 characters.");
      return;
    }
    if (value.length > 500) {
      setFeedback("Keep feedback to 500 characters.");
      return;
    }
    const next: Note = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      rating,
      message: value,
      createdAt: new Date().toISOString(),
    };
    if (save([next, ...notes].slice(0, 20))) {
      setMessage("");
      setRating(5);
      setFeedback("Saved locally on this device.");
    }
  }

  return (
    <section className="mt-24 border-t border-line pt-12" aria-labelledby="preview-feedback-heading">
      <div className="flex flex-col md:flex-row justify-between gap-5">
        <div>
          <p className="eyebrow text-mist">Community / Product concepts</p>
          <h2 id="preview-feedback-heading" className="font-display text-xl md:text-2xl tracking-[.12em] uppercase mt-4">
            Reviews & feedback
          </h2>
          <p className="text-sm leading-6 text-ivory/70 mt-4 max-w-xl">
            No verified purchaser reviews yet. This is a demo storefront.
            You can leave a personal concept note below; it stays only in this browser and is not published as a customer testimonial.
          </p>
        </div>
        <p className="eyebrow text-mist whitespace-nowrap">{ready ? `${notes.length} local ${notes.length === 1 ? "note" : "notes"}` : "Loading notes"}</p>
      </div>

      {ready && notes.length > 0 && (
        <ul className="mt-10 grid gap-4 md:grid-cols-2">
          {notes.map((note) => (
            <li key={note.id} className="border border-line p-5">
              <p className="text-ivory tracking-[.2em]" aria-label={`${note.rating} out of 5 stars`}>
                {"★".repeat(note.rating)}<span className="text-mist">{"☆".repeat(5 - note.rating)}</span>
              </p>
              <p className="text-sm leading-6 mt-4 whitespace-pre-wrap break-words">{note.message}</p>
              <div className="mt-5 flex justify-between gap-3 items-center">
                <span className="text-xs text-mist">{new Date(note.createdAt).toLocaleDateString()}</span>
                <button type="button" className="text-xs underline underline-offset-4 text-mist hover:text-ivory" onClick={() => save(notes.filter((n) => n.id !== note.id))}>
                  Delete local note
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form className="mt-10 max-w-xl border border-line p-5 md:p-7" onSubmit={submit}>
        <p className="eyebrow">Leave a preview note</p>
        <p className="text-xs text-mist mt-3 leading-5">This form does not submit a public customer review.</p>
        <fieldset className="mt-6">
          <legend className="text-xs text-mist mb-3">Concept rating</legend>
          <div className="flex gap-1" aria-label="Concept rating">
            {[1,2,3,4,5].map((value) => (
              <button key={value} type="button" aria-pressed={rating === value} aria-label={`${value} stars`} onClick={() => setRating(value)} className="p-1 text-2xl text-ivory hover:opacity-70">
                {value <= rating ? "★" : "☆"}
              </button>
            ))}
          </div>
        </fieldset>
        <label htmlFor={`feedback-${handle}`} className="block mt-6 mb-3 text-xs text-mist">Your thoughts on this piece</label>
        <textarea id={`feedback-${handle}`} value={message} onChange={(e) => setMessage(e.target.value)} maxLength={500} minLength={10} required rows={4} className="field h-auto py-3 resize-y" placeholder="What stands out to you about the design?" />
        <div className="mt-4 flex justify-between gap-4 items-center">
          <span className="text-xs text-mist">{message.length}/500</span>
          <button type="submit" className="btn-primary">Save note</button>
        </div>
        {feedback && <p role="status" className="mt-4 text-xs text-mist">{feedback}</p>}
      </form>
    </section>
  );
}
