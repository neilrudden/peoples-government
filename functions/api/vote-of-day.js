function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=60" }
  });
}

export async function onRequest({ request, env }) {
  if (request.method !== "GET") return json({ error: "Method not allowed" }, 405);
  if (!env.DR_DB) return json({ vote: null, message: "The daily question is being prepared." }, 200);

  const today = new Date().toISOString().slice(0, 10);
  const vote = await env.DR_DB.prepare(
    "SELECT id, title, question, context, sources_json, scheduled_for FROM suggestions WHERE status = 'approved' AND scheduled_for <= ? ORDER BY scheduled_for DESC, approved_at DESC LIMIT 1"
  ).bind(today).first();

  if (!vote) return json({ vote: null, message: "The daily question is being prepared." });
  let sources = [];
  try { sources = JSON.parse(vote.sources_json || "[]"); } catch {}
  return json({
    vote: {
      id: vote.id,
      title: vote.title,
      question: vote.question,
      context: vote.context,
      sources,
      published_for: vote.scheduled_for
    }
  });
}
