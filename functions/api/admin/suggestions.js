function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
  });
}

function authorised(request, env) {
  const token = request.headers.get("authorization") || "";
  return Boolean(env.ADMIN_TOKEN) && token === `Bearer ${env.ADMIN_TOKEN}`;
}

export async function onRequest({ request, env }) {
  if (!authorised(request, env)) return json({ error: "Unauthorised" }, 401);
  if (!env.DR_DB) return json({ error: "Editorial database is not configured" }, 503);

  if (request.method === "GET") {
    const { results } = await env.DR_DB.prepare(
      "SELECT id, title, question, context, sources_json, status, editor_notes, scheduled_for, created_at, updated_at, approved_at, approved_by FROM suggestions ORDER BY CASE status WHEN 'review' THEN 0 WHEN 'draft' THEN 1 WHEN 'approved' THEN 2 ELSE 3 END, updated_at DESC LIMIT 200"
    ).all();
    return json({ suggestions: results || [] });
  }

  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  let body;
  try { body = await request.json(); } catch { return json({ error: "Invalid JSON body" }, 400); }

  const title = String(body.title || "").trim();
  const question = String(body.question || "").trim();
  const context = String(body.context || "").trim();
  const sources = Array.isArray(body.sources) ? body.sources : [];
  if (title.length < 5 || title.length > 140) return json({ error: "Title must be 5–140 characters" }, 400);
  if (question.length < 15 || question.length > 700) return json({ error: "Question must be 15–700 characters" }, 400);
  if (context.length > 4000) return json({ error: "Context is too long" }, 400);
  if (sources.length > 12 || sources.some(s => typeof s !== "string" || !/^https:\/\//i.test(s))) {
    return json({ error: "Sources must be up to 12 HTTPS URLs" }, 400);
  }

  const result = await env.DR_DB.prepare(
    "INSERT INTO suggestions (title, question, context, sources_json, status) VALUES (?, ?, ?, ?, 'draft')"
  ).bind(title, question, context, JSON.stringify(sources)).run();
  const id = result.meta.last_row_id;
  await env.DR_DB.prepare(
    "INSERT INTO editorial_audit (suggestion_id, action, actor, notes) VALUES (?, 'created', 'editor', 'Created as private draft')"
  ).bind(id).run();
  return json({ id, status: "draft" }, 201);
}
