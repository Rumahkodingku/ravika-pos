const base = process.env.PERF_BASE_URL ?? "http://127.0.0.1:3200";
const iterations = 10;

async function measure(path, init) {
  const samples = [];

  for (let index = 0; index < iterations; index += 1) {
    const started = performance.now();
    const response = await fetch(`${base}${path}`, init);
    await response.arrayBuffer();
    samples.push(performance.now() - started);

    if (!response.ok) {
      throw new Error(`${path} returned ${response.status}`);
    }
  }

  samples.sort((left, right) => left - right);

  return {
    median: Number(samples[Math.floor(samples.length / 2)].toFixed(2)),
    min: Number(samples[0].toFixed(2)),
    p95: Number(samples[Math.floor(samples.length * 0.95)].toFixed(2)),
  };
}

const login = await fetch(`${base}/api/auth/login`, {
  body: JSON.stringify({ identity: "owner", password: "demo123" }),
  headers: { "content-type": "application/json" },
  method: "POST",
});

if (!login.ok) {
  throw new Error(`login returned ${login.status}`);
}

const cookie = login.headers.getSetCookie()[0]?.split(";")[0];
const headers = { cookie };
const paths = [
  "/api/health",
  "/api/products?pageSize=50",
  "/api/orders?pageSize=50",
  "/api/reports/summary?range=7d",
  "/api/kds/orders",
];
const result = {};

for (const path of paths) {
  result[path] = await measure(path, { headers });
}

console.log(
  JSON.stringify(
    {
      base,
      date: new Date().toISOString(),
      iterations,
      node: process.version,
      results: result,
    },
    null,
    2,
  ),
);
