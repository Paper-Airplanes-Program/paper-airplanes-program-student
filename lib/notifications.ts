"use client";

import { useMemo } from "react";

import { send, useApi } from "@/lib/api";
import { useUnfiledWeeks } from "@/lib/checkin";
import { useI18n } from "@/lib/i18n";
import type { AnnouncementSent, Semester, Session } from "@/lib/types";

export type NotificationKind =
  | "homework"
  | "grade"
  | "lesson"
  | "incident"
  | "person"
  | "announcement";

export type Notification = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  /** Where the bell sends you. Announcements have no page, so they read in place. */
  href: string | null;
  /** Full text revealed when an item without a destination is expanded. */
  detail: string | null;
  whenUtc: string | null;
  read: boolean;
};

export async function markAllRead(ids: string[]) {
  if (ids.length) await send("/api/notifications/read", "POST", { ids });
}

export function useNotifications(): Notification[] {
  const { t, tv } = useI18n();
  const unfiled = useUnfiledWeeks();
  const { data: me } = useApi<{ semester: Semester }>("/api/me");
  const { data: sessions } = useApi<Session[]>("/api/sessions");
  const { data: announcements } = useApi<AnnouncementSent[]>("/api/announcements");
  const { data: read } = useApi<string[]>("/api/notifications/read");

  return useMemo(() => {
    const list: Omit<Notification, "read">[] = [];

    for (const announcement of announcements ?? []) {
      const message = announcement.body ? tv(announcement.body).trim() : "";
      list.push({
        id: `announcement-${announcement.id}`,
        kind: "announcement",
        title: tv(announcement.subject),
        body: message || t("notif.announcement"),
        detail: message || null,
        href: null,
        whenUtc: announcement.sentUtc,
      });
    }

    const next = sessions?.find((session) => session.status === "scheduled");
    if (next) {
      list.push({
        id: `lesson-${next.id}`,
        kind: "lesson",
        title: t("notif.lesson"),
        body: `${tv(next.topic)} · ${next.level} · ${t("training.unit")} ${next.unitNo}`,
        detail: null,
        href: "/attendance",
        whenUtc: next.startUtc,
      });
    }

    const week = me?.semester.currentWeek;
    if (week !== undefined && unfiled.includes(week)) {
      list.push({
        id: `checkin-${week}`,
        kind: "lesson",
        title: t("notif.checkin"),
        body: `${t("common.week")} ${week}`,
        detail: null,
        href: "/attendance",
        whenUtc: null,
      });
    }

    const seen = new Set(read ?? []);
    return list
      .map((item) => ({ ...item, read: seen.has(item.id) }))
      .sort((a, b) => (b.whenUtc ?? "").localeCompare(a.whenUtc ?? ""));
  }, [sessions, announcements, unfiled, me, read, t, tv]);
}
