export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  const { startBackupScheduler } = await import(
    "@/modules/backup/backup.scheduler"
  );

  startBackupScheduler();
}
