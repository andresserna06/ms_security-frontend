// Date helpers shared by the tournament views. Dates travel as YYYY-MM-DD.

export function todayIso(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function formatDate(value?: string | null): string {
  if (!value) return "—";
  const [year, month, day] = value.slice(0, 10).split("-");
  return year && month && day ? `${day}/${month}/${year}` : value;
}

// Enrollment is open until the deadline (inclusive) of an active tournament.
export function isEnrollmentOpen(
  enrollmentDeadline?: string,
  active?: boolean,
): boolean {
  return Boolean(active && enrollmentDeadline && enrollmentDeadline >= todayIso());
}
