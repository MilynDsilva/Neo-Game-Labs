'use client';

import {
  feedbackSubmissionResponseSchema,
  gameCatalogResponseSchema,
  type GameSummary,
} from '@neogamelabs/contracts';
import Link from 'next/link';
import { type FormEvent, useEffect, useState } from 'react';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export function FeedbackForm() {
  const [games, setGames] = useState<GameSummary[]>([]);
  const [reference, setReference] = useState<string>();
  const [requiresSignIn, setRequiresSignIn] = useState(false);
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void fetch(`${apiUrl}/v1/games?limit=50`)
      .then(async (response) => {
        if (!response.ok) throw new Error();
        setGames(gameCatalogResponseSchema.parse(await response.json()).games);
      })
      .catch(() => setError('The game list is temporarily unavailable.'));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setSubmitting(true);
    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch(`${apiUrl}/v1/feedback`, {
        body: JSON.stringify({
          category: form.get('category'),
          ...(form.get('gameSlug') ? { gameSlug: form.get('gameSlug') } : {}),
          message: form.get('message'),
          rating: Number(form.get('rating')),
          website: form.get('website'),
        }),
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      });
      if (response.status === 401) {
        setRequiresSignIn(true);
        return;
      }
      if (response.status === 429) {
        setError('Too many submissions. Please try again later.');
        return;
      }
      if (!response.ok) throw new Error();
      setReference(
        feedbackSubmissionResponseSchema.parse(await response.json()).reference,
      );
    } catch {
      setError('We could not submit your feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (reference) {
    return (
      <div className="feedback-confirmation" role="status">
        <p className="eyebrow">Feedback received</p>
        <h2>Thank you for helping us improve.</h2>
        <p>
          Your support reference is <strong>{reference}</strong>. Keep it if you
          need to contact us about this submission.
        </p>
      </div>
    );
  }

  if (requiresSignIn) {
    return (
      <p className="empty-state">
        <Link className="text-link" href="/account">
          Sign in
        </Link>{' '}
        to send private feedback.
      </p>
    );
  }

  return (
    <form className="feedback-form" onSubmit={(event) => void submit(event)}>
      <label>
        Game (optional)
        <select name="gameSlug">
          <option value="">Neo Game Labs generally</option>
          {games.map((game) => (
            <option key={game.slug} value={game.slug}>
              {game.title}
            </option>
          ))}
        </select>
      </label>
      <div className="feedback-fields">
        <label>
          Category
          <select defaultValue="general" name="category" required>
            <option value="general">General</option>
            <option value="bug">Bug</option>
            <option value="gameplay">Gameplay</option>
            <option value="download">Download</option>
          </select>
        </label>
        <label>
          Rating
          <select defaultValue="5" name="rating" required>
            {[5, 4, 3, 2, 1].map((rating) => (
              <option key={rating} value={rating}>
                {rating} / 5
              </option>
            ))}
          </select>
        </label>
      </div>
      <label>
        Your feedback
        <textarea
          maxLength={2000}
          minLength={20}
          name="message"
          placeholder="Tell us what happened, what you expected, and your platform when relevant."
          required
          rows={8}
        />
      </label>
      <label aria-hidden="true" className="feedback-honeypot">
        Website
        <input autoComplete="off" name="website" tabIndex={-1} />
      </label>
      <p className="form-note">
        Feedback is private. Do not include passwords, payment details, or other
        sensitive information.
      </p>
      {error ? <p className="form-error">{error}</p> : null}
      <button disabled={submitting} type="submit">
        {submitting ? 'Sending…' : 'Send feedback'}
      </button>
    </form>
  );
}
