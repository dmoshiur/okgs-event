// Next.js calls register() once per server process at startup. Creating the
// schema here means every table exists before the first request arrives.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { initDb } = await import("@/lib/db");
  try {
    await initDb();
    console.info("OKGS database schema is ready.");
  } catch (error) {
    // Requests still retry initialisation lazily, so a transient failure here
    // should not take the whole server down at boot.
    console.error("Database initialisation failed at startup:", error);
  }
}
