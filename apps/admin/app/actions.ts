'use server';

import { revalidatePath } from 'next/cache';

import { adminRequest } from '../lib/admin-api';

export async function updateGame(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  await adminRequest(`/games/${encodeURIComponent(id)}`, {
    body: JSON.stringify({
      featured: formData.get('featured') === 'on',
      pointPrice: Number(formData.get('pointPrice')),
      status: String(formData.get('status')),
    }),
    method: 'PATCH',
  });
  revalidatePath('/');
}

export async function updateFeedback(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  await adminRequest(`/feedback/${encodeURIComponent(id)}`, {
    body: JSON.stringify({
      internalNotes: String(formData.get('internalNotes') ?? ''),
      status: String(formData.get('status')),
    }),
    method: 'PATCH',
  });
  revalidatePath('/');
}

export async function creditCustomer(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  await adminRequest(`/customers/${encodeURIComponent(id)}/credits`, {
    body: JSON.stringify({
      points: Number(formData.get('points')),
      reason: String(formData.get('reason') ?? ''),
    }),
    method: 'POST',
  });
  revalidatePath('/');
}
