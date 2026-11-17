// SubCheck email capture: POST /api/subscribe { email, website (honeypot), source (optional) }
// Stores the email in D1 (binding SUBCHECK_DB, table subscribers).
// No subscription data is ever sent here; the form only carries an email address.
export async function onRequestPost(context) {
  const { request, env } = context;
  let body;
  try { body = await request.json(); } catch { return json({ error: 'Bad request' }, 400); }

  // Honeypot: real users never fill the hidden "website" field.
  if (body.website) return json({ ok: true });

  const email = String(body.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254) {
    return json({ error: 'Please enter a valid email address.' }, 422);
  }
  if (!env.SUBCHECK_DB) return json({ error: 'Signup is not available yet.' }, 503);

  // Source tag: only known signup surfaces are recorded; anything else
  // falls back to the original results-page tag.
  const source = ['results-page', 'launch-page'].includes(body.source) ? body.source : 'results-page';

  try {
    await env.SUBCHECK_DB
      .prepare('INSERT OR IGNORE INTO subscribers (email, created_at, source) VALUES (?, ?, ?)')
      .bind(email, new Date().toISOString(), source)
      .run();
  } catch (e) {
    return json({ error: 'Something went wrong. Please try again.' }, 500);
  }
  return json({ ok: true });
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
