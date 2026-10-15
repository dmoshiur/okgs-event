// Shared attendance queries. Each attendee's *current* gate state is taken from their
// most recent attendance log, so a check-in followed by a check-out counts as "exited".

// Day boundaries follow Bangladesh time (UTC+6), where the event runs.
export const TODAY_FILTER = "date(timestamp, '+6 hours') = date('now', '+6 hours')";

export const CURRENT_STATE_CTE = `
  WITH latest AS (
    SELECT user_id, type,
      ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY timestamp DESC, id DESC) AS rn
    FROM attendance_logs
  ),
  current_state AS (
    SELECT user_id, type FROM latest WHERE rn = 1
  ),
  admitted AS (
    SELECT DISTINCT user_id FROM attendance_logs WHERE type = 'check_in'
  )`;

export function toNumber(value) {
  return Number(value || 0);
}
