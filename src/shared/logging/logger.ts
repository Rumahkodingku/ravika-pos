type LogFields = Record<string, unknown>;

function write(level: "error" | "info", message: string, fields: LogFields) {
  const line = JSON.stringify({
    level,
    message,
    time: new Date().toISOString(),
    ...fields,
  });

  if (level === "error") {
    console.error(line);
    return;
  }

  console.log(line);
}

export const logger = {
  info: (message: string, fields: LogFields = {}) =>
    write("info", message, fields),
  error: (message: string, fields: LogFields = {}) =>
    write("error", message, fields),
};
