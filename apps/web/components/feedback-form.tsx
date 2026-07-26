'use client';

import {
  feedbackSubmissionResponseSchema,
  gameCatalogResponseSchema,
  type GameSummary,
} from '@neogamelabs/contracts';
import Link from 'next/link';
import { type FormEvent, useEffect, useRef, useState } from 'react';

import { useAuth } from './auth-provider';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const maximumMessageLength = 2000;

export function FeedbackForm({
  initialGameSlug = '',
}: Readonly<{ initialGameSlug?: string }>) {
  const { authenticated, error: authError, loading, refresh } = useAuth();
  const [games, setGames] = useState<GameSummary[]>([]);
  const [reference, setReference] = useState<string>();
  const [gameSlug, setGameSlug] = useState(initialGameSlug);
  const [category, setCategory] = useState('general');
  const [rating, setRating] = useState('5');
  const [message, setMessage] = useState('');
  const [gamesError, setGamesError] = useState<string>();
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const errorReference = useRef<HTMLParagraphElement>(null);
  const confirmationReference = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authenticated) return;

    void fetch(`${apiUrl}/v1/games?limit=50`)
      .then(async (response) => {
        if (!response.ok) throw new Error();
        setGames(gameCatalogResponseSchema.parse(await response.json()).games);
      })
      .catch(() =>
        setGamesError(
          'The game list is temporarily unavailable. You can still send general feedback.',
        ),
      );
  }, [authenticated]);

  useEffect(() => {
    if (error) errorReference.current?.focus();
  }, [error]);

  useEffect(() => {
    if (reference) confirmationReference.current?.focus();
  }, [reference]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    if (message.trim().length < 20) {
      setError(
        'Please enter at least 20 characters so we can understand the issue.',
      );
      return;
    }

    setSubmitting(true);
    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch(`${apiUrl}/v1/feedback`, {
        body: JSON.stringify({
          category,
          ...(gameSlug ? { gameSlug } : {}),
          message: message.trim(),
          rating: Number(rating),
          website: form.get('website'),
        }),
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      });
      if (response.status === 401) {
        setError(
          'Your session expired. Sign in again to send your saved feedback.',
        );
        await refresh();
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

  async function copyReference() {
    if (!reference) return;
    await navigator.clipboard.writeText(reference);
    setCopied(true);
  }

  if (loading) {
    return (
      <p className="empty-state" role="status">
        Checking your account…
      </p>
    );
  }

  if (authError) {
    return (
      <div className="empty-state" role="alert">
        <p>{authError}</p>
        <button onClick={() => void refresh()} type="button">
          Try again
        </button>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <p className="empty-state">
        <Link className="text-link" href="/account">
          Sign in
        </Link>{' '}
        to send private feedback.
      </p>
    );
  }

  if (reference) {
    return (
      <div
        className="feedback-confirmation"
        ref={confirmationReference}
        role="status"
        tabIndex={-1}
      >
        <p className="eyebrow">Feedback received</p>
        <h2>Thank you for helping us improve.</h2>
        <p>
          Your support reference is <strong>{reference}</strong>. Keep it if you
          need to contact us about this submission.
        </p>
        <div className="feedback-confirmation-actions">
          <button onClick={() => void copyReference()} type="button">
            {copied ? 'Copied' : 'Copy reference'}
          </button>
          <Link className="text-link" href="/contact">
            Contact support
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form className="feedback-form" onSubmit={(event) => void submit(event)}>
      <label>
        Game (optional)
        <select
          name="gameSlug"
          onChange={(event) => setGameSlug(event.target.value)}
          value={gameSlug}
        >
          <option value="">Neo Game Labs generally</option>
          {games.map((game) => (
            <option key={game.slug} value={game.slug}>
              {game.title}
            </option>
          ))}
        </select>
      </label>
      {gamesError ? <p className="form-error">{gamesError}</p> : null}
      <div className="feedback-fields">
        <label>
          Category
          <select
            name="category"
            onChange={(event) => setCategory(event.target.value)}
            required
            value={category}
          >
            <option value="general">General</option>
            <option value="bug">Bug</option>
            <option value="gameplay">Gameplay</option>
            <option value="download">Download</option>
          </select>
        </label>
        <label>
          Rating
          <select
            name="rating"
            onChange={(event) => setRating(event.target.value)}
            required
            value={rating}
          >
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
          aria-describedby={`feedback-message-guidance feedback-message-count${
            error ? ' feedback-error' : ''
          }`}
          maxLength={maximumMessageLength}
          minLength={20}
          name="message"
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Tell us what happened, what you expected, and your platform when relevant."
          required
          rows={8}
          value={message}
        />
      </label>
      <label aria-hidden="true" className="feedback-honeypot">
        Website
        <input autoComplete="off" name="website" tabIndex={-1} />
      </label>
      <div className="feedback-message-meta">
        <p className="form-note" id="feedback-message-guidance">
          Feedback is private. Do not include passwords, payment details, or
          other sensitive information.
        </p>
        <p aria-live="polite" className="form-note" id="feedback-message-count">
          {maximumMessageLength - message.length} characters remaining
        </p>
      </div>
      {error ? (
        <p
          className="form-error"
          id="feedback-error"
          ref={errorReference}
          role="alert"
          tabIndex={-1}
        >
          {error}
        </p>
      ) : null}
      <button disabled={submitting} type="submit">
        {submitting ? 'Sending…' : 'Send feedback'}
      </button>
    </form>
  );
}
