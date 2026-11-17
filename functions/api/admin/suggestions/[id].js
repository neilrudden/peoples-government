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

export async function onRequest({ request, env, params }) {
  if (!authorised(request, env)) return json({ error: "Unauthorised" }, 401);
  if (!env.DR_DB) return json({ error: "Editorial database is not configured" }, 503);
  if (request.method !== "PATCH") return json({ error: "Method not allowed" }, 405);

  const id = Number(params.id);
  if (!Number.isSafeInteger(id) || id < 1) return json({ error: "Invalid suggestion ID" }, 400);
  let body;
  try { body = await request.json(); } catch { return json({ error: "Invalid JSON body" }, 400); }

  const current = await env.DR_DB.prepare("SELECT * FROM suggestions WHERE id = ?").bind(id).first();
  if (!current) return json({ error: "Suggestion not found" }, 404);

  const allowed = new Set(["draft", "review", "approved", "archived"]);
  const status = body.status === undefined ? current.status : String(body.status);
  if (!allowed.has(status)) return json({ error: "Invalid status" }, 400);

  const title = body.title === undefined ? current.title : String(body.title).trim();
  const question = body.question === undefined ? current.question : String(body.question).trim();
  const context = body.context === undefined ? current.context : String(body.context).trim();
  const editorNotes = body.editor_notes === undefined ? current.editor_notes : String(body.editor_notes).trim();
  const scheduledFor = body.scheduled_for === undefined ? current.scheduled_for : body.scheduled_for;
  let sourcesJson = current.sources_json;
  if (body.sources !== undefined) {
    if (!Array.isArray(body.sources) || body.sources.length > 12 || body.sources.some(s => typeof s !== "string" || !/^https:\/\//i.test(s))) {
      return json({ error: "Sources must be up to 12 HTTPS URLs" }, 400);
    }
    sourcesJson = JSON.stringify(body.sources);
  }

  if (title.length < 5 || title.length > 140 || question.length < 15 || question.length > 700 || context.length > 4000 || editorNotes.length > 4000) {
    return json({ error: "Please check title, question, context and editor notes lengths" }, 400);
  }
  if (status === "approved") {
    if (!scheduledFor || !/^\d{4}-\d{2}-\d{2}$/.test(scheduledFor)) {
      return json({ error: "An approved question needs a publication date (YYYY-MM-DD)" }, 400);
    }
    if (JSON.parse(sourcesJson).length === 0) {
      return json({ error: "Add at least one source before approval" }, 400);
    }
  }

  const actor = "editor";
  await env.DR_DB.prepare(
    "UPDATE suggestions SET title = ?, question = ?, context = ?, sources_json = ?, status = ?, editor_notes = ?, scheduled_for = ?, updated_at = datetime('now'), approved_at = ?, approved_by = ? WHERE id = ?"
  ).bind(title, question, context, sourcesJson, status, editorNotes, scheduledFor || null,
    status === "approved" ? new Date().toISOString() : null,
    status === "approved" ? actor : null, id).run();

  const action = status === "approved" ? "approved" : status === "review" ? "sent_to_review" : status === "archived" ? "archived" : "updated";
  await env.DR_DB.prepare(
    "INSERT INTO editorial_audit (suggestion_id, action, actor, notes) VALUES (?, ?, ?, ?)"
  ).bind(id, action, actor, editorNotes).run();

  return json({ id, status, scheduled_for: scheduledFor || null });
}
