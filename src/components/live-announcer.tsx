"use client";

import { useEffect, useRef } from "react";
import { useAssessment } from "@/store/assessment-store";
import { logUpdate } from "@/lib/updates";

/**
 * Feeds the assessment store's announcements into the persistent change log.
 * The global announcer (AppShell) does the speaking and the toast; this just
 * makes sure evidence-driven changes are recorded against this employee.
 */
export function LiveAnnouncer() {
  const { state, employee } = useAssessment();
  const a = state.announcement;
  const last = useRef(0);

  useEffect(() => {
    if (!a || a.id <= last.current) return;
    last.current = a.id;
    logUpdate(`${employee.name}: ${a.text}`, a.priority, employee.id);
  }, [a, employee.id, employee.name]);

  return null;
}
