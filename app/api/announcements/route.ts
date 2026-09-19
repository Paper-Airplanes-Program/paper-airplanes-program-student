import { requireActive } from "@/lib/actor";
import { ok, read } from "@/lib/db";
import type { AnnouncementSent } from "@/lib/types";

type Store = { history: AnnouncementSent[] };

// The bell is the only surface for announcements, so cap the feed instead of
// letting every announcement ever sent pile up in it.
const FEED_LIMIT = 10;

export async function GET() {
  const user = await requireActive();
  if (user instanceof Response) return user;

  const store = await read<Store>("announcements");
  const mine = store.history
    .filter((announcement) => announcement.audience === "students")
    .sort((a, b) => b.sentUtc.localeCompare(a.sentUtc))
    .slice(0, FEED_LIMIT);

  return ok(mine);
}
