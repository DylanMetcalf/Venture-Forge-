// Rules for the daily session: what counts as work, when a day can be closed,
// and how closing a day turns work into evidence.
import { getDay, isAuthored } from "../content/curriculum";
import { DomainError, emptySession, type AppState, type Evidence, type SessionRecord, type SessionStatus } from "./types";
import { isBlank, localDate, newId } from "./util";

/**
 * Minimum characters for an Act/Build response to count as demonstrated work.
 * Deliberately low: it filters out "done" and "x", not short honest answers.
 */
export const MIN_WORK_CHARS = 20;

export function sessionFor(state: AppState, day: number): SessionRecord {
  return state.sessions[day] ?? emptySession();
}

export function hasRecordedWork(rec: SessionRecord): boolean {
  const work = [rec.responses.act, rec.responses.build];
  return work.some((w) => !isBlank(w) && w!.trim().length >= MIN_WORK_CHARS);
}

function hasAnything(rec: SessionRecord): boolean {
  return [rec.commitment, rec.responses.think, rec.responses.act, rec.responses.build, rec.reflection.learned, rec.reflection.avoided].some(
    (v) => !isBlank(v),
  );
}

export function sessionStatus(rec: SessionRecord | undefined): SessionStatus {
  if (!rec) return "not_started";
  if (rec.closedAt) return hasRecordedWork(rec) ? "demonstrated" : "consumed";
  return hasAnything(rec) || rec.startedAt ? "in_progress" : "not_started";
}

export function isClosed(status: SessionStatus): boolean {
  return status === "consumed" || status === "demonstrated";
}

/** Reasons a session can't be closed yet. Empty means it can. */
export function closeBlockers(rec: SessionRecord): string[] {
  const reasons: string[] = [];
  if (!isBlank(rec.commitment) && rec.commitmentKept === undefined) {
    reasons.push("Mark this morning's promise as kept or not kept.");
  }
  const wroteSomething = [rec.responses.think, rec.responses.act, rec.responses.build, rec.reflection.learned].some((v) => !isBlank(v));
  if (!wroteSomething) {
    reasons.push("Write something first — at minimum, what you learned.");
  }
  return reasons;
}

function withSession(state: AppState, day: number, fn: (rec: SessionRecord) => void): AppState {
  if (!isAuthored(day)) throw new DomainError(`Day ${day} hasn't been authored yet.`);
  const next = structuredClone(state);
  const rec = next.sessions[day] ?? emptySession();
  fn(rec);
  next.sessions[day] = rec;
  return next;
}

export function commit(state: AppState, day: number, promise: string, now: Date): AppState {
  if (isBlank(promise)) throw new DomainError("Write a promise first.");
  return withSession(state, day, (rec) => {
    rec.commitment = promise.trim();
    rec.startedAt ??= now.toISOString();
  });
}

export function gradeCommitment(state: AppState, day: number, kept: boolean): AppState {
  return withSession(state, day, (rec) => {
    if (isBlank(rec.commitment)) throw new DomainError("There's no promise to grade.");
    rec.commitmentKept = kept;
  });
}

export type SessionPatch = {
  responses?: Partial<SessionRecord["responses"]>;
  reflection?: Partial<SessionRecord["reflection"]>;
  projectId?: string | null;
};

/** Saves draft work. Allowed on closed sessions too; call closeSession again to refresh evidence. */
export function updateSession(state: AppState, day: number, patch: SessionPatch, now: Date): AppState {
  return withSession(state, day, (rec) => {
    if (patch.responses) Object.assign(rec.responses, patch.responses);
    if (patch.reflection) Object.assign(rec.reflection, patch.reflection);
    if (patch.projectId !== undefined) {
      if (patch.projectId === null) delete rec.projectId;
      else rec.projectId = patch.projectId;
    }
    rec.startedAt ??= now.toISOString();
  });
}

function evidenceNote(rec: SessionRecord): string {
  const parts: string[] = [];
  if (!isBlank(rec.responses.act)) parts.push(rec.responses.act!.trim());
  if (!isBlank(rec.responses.build)) parts.push(rec.responses.build!.trim());
  return parts.join("\n\n");
}

/**
 * Close (or re-close) a session. If it contains real work, the session's
 * single evidence item is created or updated; if the work was removed, it's
 * withdrawn. Session evidence is never duplicated.
 */
export function closeSession(state: AppState, day: number, now: Date): AppState {
  const content = getDay(day);
  const blockers = closeBlockers(sessionFor(state, day));
  if (blockers.length) throw new DomainError(blockers[0]!);
  const next = withSession(state, day, (rec) => {
    rec.closedAt = now.toISOString();
    rec.closedOn = localDate(now);
  });
  const rec = next.sessions[day]!;
  const existing = next.evidence.findIndex((e) => e.source.kind === "session" && e.source.day === day);
  if (hasRecordedWork(rec)) {
    const item: Evidence = {
      id: existing >= 0 ? next.evidence[existing]!.id : newId(),
      createdAt: existing >= 0 ? next.evidence[existing]!.createdAt : now.toISOString(),
      date: rec.closedOn!,
      title: `Day ${day} — ${content!.theme}`,
      note: evidenceNote(rec),
      skills: [...content!.skills],
      projectId: rec.projectId,
      source: { kind: "session", day },
    };
    if (existing >= 0) next.evidence[existing] = item;
    else next.evidence.push(item);
  } else if (existing >= 0) {
    next.evidence.splice(existing, 1);
  }
  return next;
}

export function reopenSession(state: AppState, day: number): AppState {
  return withSession(state, day, (rec) => {
    delete rec.closedAt;
    delete rec.closedOn;
  });
}

export function goToDay(state: AppState, day: number): AppState {
  if (!Number.isInteger(day) || day < 1) throw new DomainError("Invalid day.");
  // Allow moving one past the last authored day, so "advance" after the final
  // authored session lands on an honest "not written yet" screen.
  if (!isAuthored(day) && !isAuthored(day - 1)) {
    throw new DomainError(`Day ${day} hasn't been authored yet.`);
  }
  return { ...state, currentDay: day };
}
