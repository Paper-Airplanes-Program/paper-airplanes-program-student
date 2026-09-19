import { requireActive } from "@/lib/actor";
import { ok, read } from "@/lib/db";
import type { Session } from "@/lib/types";

export async function GET() {
  const user = await requireActive();
  if (user instanceof Response) return user;
  const sessions = await read<Session[]>("sessions");
  return ok(sessions.filter((session) => session.studentName === user.name));
}
