'use client';

import {
  gameCommentSchema,
  gameCommentsResponseSchema,
  type GameComment,
} from '@neogamelabs/contracts';
import Link from 'next/link';
import { type FormEvent, useEffect, useState } from 'react';

import { useAuth } from './auth-provider';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const maximumLength = 500;

export function GameComments({ gameSlug }: Readonly<{ gameSlug: string }>) {
  const { authenticated, loading: authLoading } = useAuth();
  const [comments, setComments] = useState<GameComment[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string>();
  const [submitError, setSubmitError] = useState<string>();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function loadComments() {
    setLoadError(undefined);
    setLoading(true);
    try {
      const response = await fetch(
        `${apiUrl}/v1/games/${encodeURIComponent(gameSlug)}/comments`,
      );
      if (!response.ok) throw new Error('Comment request failed');
      setComments(
        gameCommentsResponseSchema.parse(await response.json()).comments,
      );
    } catch {
      setLoadError('Comments could not be loaded.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadComments();
  }, [gameSlug]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(undefined);
    setSubmitted(false);
    if (message.trim().length < 3) {
      setSubmitError('Please enter at least 3 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(
        `${apiUrl}/v1/games/${encodeURIComponent(gameSlug)}/comments`,
        {
          body: JSON.stringify({ message: message.trim() }),
          credentials: 'include',
          headers: { 'content-type': 'application/json' },
          method: 'POST',
        },
      );
      if (response.status === 401) {
        setSubmitError('Your session expired. Sign in again to comment.');
        return;
      }
      if (response.status === 429) {
        setSubmitError(
          'You are commenting too quickly. Please try again later.',
        );
        return;
      }
      if (!response.ok) throw new Error('Comment submission failed');

      const comment = gameCommentSchema.parse(await response.json());
      setComments((current) => [comment, ...current]);
      setMessage('');
      setSubmitted(true);
    } catch {
      setSubmitError('Your comment could not be posted. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="comments-section" aria-labelledby="comments-heading">
      <div className="comments-heading">
        <div>
          <p className="eyebrow">Player discussion</p>
          <h2 id="comments-heading">Comments</h2>
        </div>
        {!loading && !loadError ? (
          <span>
            {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
          </span>
        ) : null}
      </div>

      {authLoading ? (
        <p className="comment-auth-state" role="status">
          Checking your account…
        </p>
      ) : authenticated ? (
        <form className="comment-form" onSubmit={(event) => void submit(event)}>
          <label htmlFor="game-comment">Join the discussion</label>
          <textarea
            aria-describedby={`comment-guidance comment-count${
              submitError ? ' comment-error' : ''
            }`}
            id="game-comment"
            maxLength={maximumLength}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Share what you enjoyed or something that could improve."
            rows={4}
            value={message}
          />
          <div className="comment-form-meta">
            <p id="comment-guidance">
              Be constructive and do not share personal information.
            </p>
            <p aria-live="polite" id="comment-count">
              {maximumLength - message.length} characters remaining
            </p>
          </div>
          {submitError ? (
            <p className="form-error" id="comment-error" role="alert">
              {submitError}
            </p>
          ) : null}
          {submitted ? (
            <p className="account-notice" role="status">
              Your comment was posted.
            </p>
          ) : null}
          <button disabled={submitting} type="submit">
            {submitting ? 'Posting…' : 'Post comment'}
          </button>
        </form>
      ) : (
        <p className="comment-auth-state">
          <Link className="text-link" href="/account">
            Sign in
          </Link>{' '}
          to join the discussion.
        </p>
      )}

      {loading ? <p role="status">Loading comments…</p> : null}
      {loadError ? (
        <div className="inline-error" role="alert">
          <p>{loadError}</p>
          <button onClick={() => void loadComments()} type="button">
            Try again
          </button>
        </div>
      ) : null}
      {!loading && !loadError && comments.length === 0 ? (
        <p className="empty-state">No comments yet. Start the discussion.</p>
      ) : null}
      {comments.length > 0 ? (
        <ol className="comment-list">
          {comments.map((comment) => (
            <li key={comment.id}>
              <div className="comment-author">
                {comment.author.pictureUrl ? (
                  <img alt="" src={comment.author.pictureUrl} />
                ) : (
                  <span aria-hidden="true">
                    {comment.author.displayName.charAt(0).toUpperCase()}
                  </span>
                )}
                <div>
                  <strong>{comment.author.displayName}</strong>
                  <time dateTime={comment.createdAt}>
                    {new Intl.DateTimeFormat('en', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    }).format(new Date(comment.createdAt))}
                  </time>
                </div>
              </div>
              <p>{comment.message}</p>
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  );
}
