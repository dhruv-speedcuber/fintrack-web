import { kv } from "@vercel/kv";

const KEY         = "fintrack:data";
const REV_KEY     = "fintrack:rev";
const BACKUP_LIST = "fintrack:backups";
const MAX_BACKUPS = 20;

/**
 * IMPORTANT DESIGN NOTE
 *
 * A previous version of this route caught KV errors and returned demo data
 * with a 200 status. The client could not tell "the store is down" from
 * "here is your real data", so it kept its demo defaults in state and then
 * POSTed them straight back — permanently overwriting the user's real data.
 *
 * Rules now:
 *   1. Never invent data. A read failure is a 503, never a 200.
 *   2. An empty store returns data:null. It does NOT return demo values.
 *   3. Writes are revision-checked, so a client that failed to load can
 *      never blind-overwrite a good record.
 *   4. Every write snapshots the previous value into a capped backup list.
 */

const SHAPE = ["accounts", "investments", "goals", "liabilities", "snapshots"];

function validate(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return "Payload must be an object";
  }
  for (const k of SHAPE) {
    if (!(k in data)) return `Missing "${k}"`;
    if (!Array.isArray(data[k])) return `"${k}" must be an array`;
  }
  return null;
}

const fail = (status, error, extra = {}) =>
  Response.json({ ok: false, error, ...extra }, { status });

export async function GET(request) {
  const wantsBackups =
    new URL(request.url).searchParams.get("backups") !== null;

  try {
    if (wantsBackups) {
      const raw = await kv.lrange(BACKUP_LIST, 0, MAX_BACKUPS - 1);
      const backups = (raw || []).map((entry, i) => {
        const parsed = typeof entry === "string" ? JSON.parse(entry) : entry;
        return {
          index: i,
          at: parsed.at,
          rev: parsed.rev,
          counts: Object.fromEntries(
            SHAPE.map((k) => [k, (parsed.data?.[k] || []).length])
          ),
        };
      });
      return Response.json({ ok: true, backups });
    }

    const [data, rev] = await Promise.all([kv.get(KEY), kv.get(REV_KEY)]);

    return Response.json({
      ok: true,
      data: data ?? null,        // null means "nothing stored yet"
      rev: typeof rev === "number" ? rev : 0,
    });
  } catch (e) {
    // Loud, honest failure. The client must not fall back to defaults.
    return fail(503, `Storage unavailable: ${e?.message || e}`);
  }
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return fail(400, "Invalid JSON body");
  }

  const { data, baseRev } = body || {};

  const invalid = validate(data);
  if (invalid) return fail(400, invalid);

  if (typeof baseRev !== "number") {
    // Refuse writes from any client that did not complete a successful read.
    return fail(400, "baseRev is required — refusing a blind write");
  }

  try {
    const currentRev = (await kv.get(REV_KEY)) ?? 0;

    if (baseRev !== currentRev) {
      return fail(
        409,
        "Your copy is out of date — reload before saving",
        { code: "stale", rev: currentRev }
      );
    }

    const previous = await kv.get(KEY);
    if (previous) {
      await kv.lpush(
        BACKUP_LIST,
        JSON.stringify({ at: new Date().toISOString(), rev: currentRev, data: previous })
      );
      await kv.ltrim(BACKUP_LIST, 0, MAX_BACKUPS - 1);
    }

    const nextRev = currentRev + 1;
    await kv.set(KEY, data);
    await kv.set(REV_KEY, nextRev);

    return Response.json({ ok: true, rev: nextRev, savedAt: new Date().toISOString() });
  } catch (e) {
    return fail(500, `Save failed: ${e?.message || e}`);
  }
}

/** Restore a previous snapshot by its index in the backup list. */
export async function PUT(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return fail(400, "Invalid JSON body");
  }

  const { index } = body || {};
  if (!Number.isInteger(index) || index < 0 || index >= MAX_BACKUPS) {
    return fail(400, "index must be a valid backup position");
  }

  try {
    const raw = await kv.lrange(BACKUP_LIST, index, index);
    if (!raw || raw.length === 0) return fail(404, "No backup at that position");

    const entry = typeof raw[0] === "string" ? JSON.parse(raw[0]) : raw[0];
    const invalid = validate(entry?.data);
    if (invalid) return fail(422, `Backup is unusable: ${invalid}`);

    const currentRev = (await kv.get(REV_KEY)) ?? 0;
    const current = await kv.get(KEY);

    // Snapshot what we are about to replace, so a restore is itself undoable.
    if (current) {
      await kv.lpush(
        BACKUP_LIST,
        JSON.stringify({ at: new Date().toISOString(), rev: currentRev, data: current })
      );
      await kv.ltrim(BACKUP_LIST, 0, MAX_BACKUPS - 1);
    }

    const nextRev = currentRev + 1;
    await kv.set(KEY, entry.data);
    await kv.set(REV_KEY, nextRev);

    return Response.json({ ok: true, rev: nextRev, data: entry.data });
  } catch (e) {
    return fail(500, `Restore failed: ${e?.message || e}`);
  }
}
