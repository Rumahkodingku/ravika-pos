export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  const { startBackupScheduler } = await import(
    "@/modules/backup/backup.scheduler"
  );
  const { startNetworkMonitor, stopNetworkMonitor } = await import(
    "@/modules/network/network.service"
  );

  startBackupScheduler();
  startNetworkMonitor();
  process.once("SIGTERM", stopNetworkMonitor);
  process.once("SIGINT", stopNetworkMonitor);
}
