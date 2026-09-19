"use client";

import { CalendarCheck } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/components/portal/app-shell";
import {
  EmptyState,
  Loading,
  Row,
  SectionCard,
  StatCard,
  StatusPill,
} from "@/components/portal/kit";
import { Button, Input, Radio, Select, Textarea, useToast } from "@/components/ui";
import { useApi } from "@/lib/api";
import {
  openWeeks,
  reasonLabel,
  submitCheckin,
  useMyCheckins,
  useSemester,
} from "@/lib/checkin";
import { useI18n } from "@/lib/i18n";
import type {
  AttendanceSummary,
  CheckIn,
  Semester,
  TutorProfile,
} from "@/lib/types";
import { studentNav } from "@/lib/nav";
import { formatDate } from "@/lib/time";

export function AttendanceView() {
  const { t, tv, locale } = useI18n();
  const { semester } = useSemester();
  const { data: me } = useApi<{
    tutor: TutorProfile | null;
    attendance: AttendanceSummary;
  }>("/api/me");
  const { rows: filed, loading } = useMyCheckins();

  const [picked, setPicked] = useState<number | null>(null);
  const week = picked ?? semester?.currentWeek ?? 0;
  const thisWeek = filed.find((row) => row.week === week);
  const attendance = me?.attendance;
  // Nothing filed yet means there is nothing to average, not a zero attendance rate.
  const counted = !!attendance && attendance.totalSessions > 0;

  return (
    <AppShell
      nav={studentNav}
      title={t("checkin.title")}
      description={
        semester && me
          ? [tv(semester.name), me.tutor?.name].filter(Boolean).join(" · ")
          : t("common.loading")
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label={t("student.rate")}
          value={counted ? `${attendance!.rate}%` : "—"}
          accent="var(--accent-cool)"
        />
        <StatCard
          label={t("student.attendedcount")}
          value={counted ? attendance!.attended : "—"}
          accent="var(--accent-mint)"
          delay={90}
        />
        <StatCard
          label={t("student.missedcount")}
          value={counted ? attendance!.missed : "—"}
          accent="var(--accent)"
          delay={180}
        />
      </div>

      <SectionCard
        title={t("checkin.form")}
        description={t("checkin.subtitlestudent")}
        action={
          thisWeek ? (
            <StatusPill tone="success">{t("checkin.filed")}</StatusPill>
          ) : (
            <StatusPill tone="warning">{t("checkin.notyet")}</StatusPill>
          )
        }
      >
        <Select
          label={t("checkin.week")}
          value={String(week)}
          onChange={(event) => setPicked(Number(event.target.value))}
          options={openWeeks(semester).map((entry) => ({
            value: String(entry.week),
            label: `${t("common.week")} ${entry.week} · ${formatDate(entry.start, locale)} – ${formatDate(entry.end, locale)}`,
          }))}
          wrapperClassName="sm:max-w-[26rem]"
        />

        {semester ? (
          <WeekForm key={week} week={week} filed={thisWeek} semester={semester} />
        ) : (
          <Loading />
        )}
      </SectionCard>

      <SectionCard title={t("checkin.history")} delay={80}>
        {loading ? (
          <Loading />
        ) : filed.length === 0 ? (
          <EmptyState message={t("common.empty")} />
        ) : (
          <ul className="flex flex-col gap-3">
            {filed.map((row) => {
              const reason = reasonLabel(semester, row.reason);
              return (
                <Row key={row.id}>
                  <div className="min-w-0">
                    <p className="truncate text-[13.5px] font-bold text-fg">
                      {t("common.week")} {row.week}
                    </p>
                    <p className="truncate text-[11.5px] text-fg-subtle">
                      {row.held
                        ? `${row.minutes} ${t("lesson.min")}`
                        : reason
                          ? tv(reason)
                          : t("checkin.nosession")}
                    </p>
                  </div>
                  <StatusPill tone={row.held ? "success" : "danger"}>
                    {row.held ? t("checkin.held") : t("checkin.nosession")}
                  </StatusPill>
                </Row>
              );
            })}
          </ul>
        )}
      </SectionCard>
    </AppShell>
  );
}

function WeekForm({
  week,
  filed,
  semester,
}: {
  week: number;
  filed: CheckIn | undefined;
  semester: Semester;
}) {
  const { t, tv } = useI18n();
  const toast = useToast();

  const [held, setHeld] = useState(filed ? filed.held : true);
  const [minutes, setMinutes] = useState(String(filed?.minutes ?? 60));
  const [reason, setReason] = useState(
    filed?.reason ?? semester.absenceReasons[0].value,
  );
  const [note, setNote] = useState(filed?.note ?? "");

  return (
    <form
      className="mt-5 flex flex-col gap-5"
      onSubmit={async (event) => {
        event.preventDefault();
        await submitCheckin({
          week,
          held,
          minutes: held ? Number(minutes) || 0 : null,
          reason: held ? null : reason,
          note: note.trim() || null,
        });
        toast.success(t("checkin.sent"));
      }}
    >
      <fieldset className="flex flex-col gap-2">
        <legend className="text-[13px] font-semibold text-fg">
          {t("checkin.happenedstudent")}
        </legend>
        <div className="mt-1 flex gap-6">
          {[
            { value: true, label: t("common.yes") },
            { value: false, label: t("common.no") },
          ].map((option) => (
            <label
              key={String(option.value)}
              className="flex cursor-pointer items-center gap-2.5 text-[13.5px] text-fg"
            >
              <Radio
                name={`held-${week}`}
                checked={held === option.value}
                onChange={() => setHeld(option.value)}
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      {held ? (
        <Input
          label={t("checkin.minutes")}
          type="number"
          min={0}
          max={300}
          dir="ltr"
          value={minutes}
          onChange={(event) => setMinutes(event.target.value)}
          wrapperClassName="sm:max-w-[14rem]"
        />
      ) : (
        <Select
          label={t("checkin.reason")}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          options={semester.absenceReasons.map((entry) => ({
            value: entry.value,
            label: tv(entry.label),
          }))}
        />
      )}

      <Textarea
        label={t("common.notes")}
        placeholder={t("common.optional")}
        className="min-h-24"
        value={note}
        onChange={(event) => setNote(event.target.value)}
      />

      <Button type="submit" className="self-start">
        <CalendarCheck className="h-4 w-4" />
        {t("checkin.send")}
      </Button>
    </form>
  );
}
