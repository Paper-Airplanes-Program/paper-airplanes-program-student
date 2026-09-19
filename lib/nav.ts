import { CalendarCheck, Sparkles } from "lucide-react";

import type { NavItem } from "@/components/portal/app-shell";

export const studentNav: NavItem[] = [
  { href: "/onboarding", labelKey: "nav.onboarding", icon: Sparkles },
  { href: "/attendance", labelKey: "nav.attendance", icon: CalendarCheck },
];
