import { requireActive } from "@/lib/actor";
import { ok, read, update } from "@/lib/db";
import type { CheckIn, TutorProfile } from "@/lib/types";

export async function GET() {
  const user = await requireActive();
  if (user instanceof Response) return user;
  const rows = await read<CheckIn[]>("checkins");
  return ok(
    rows.filter((row) => row.studentName === user.name).sort((a, b) => b.week - a.week),
  );
}

export async function POST(request: Request) {
  const user = await requireActive();
  if (user instanceof Response) return user;
  const tutor = await read<TutorProfile>("tutor-profile");
  const body = (await request.json()) as Omit<CheckIn, "id" | "studentName" | "tutorName">;

  const rows = await update<CheckIn[]>("checkins", (current) => [
    {
      ...body,
      id: "chk_" + user.id + "_w" + body.week,
      studentName: user.name,
      tutorName: tutor.name,
    },
    ...current.filter(
      (row) => !(row.week === body.week && row.studentName === user.name),
    ),
  ]);
  return ok(rows.filter((row) => row.studentName === user.name));
}
