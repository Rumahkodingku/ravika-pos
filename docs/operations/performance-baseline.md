# Performance Baseline

**Tanggal:** 18 November 2026
**Lingkungan:** WSL2 Linux 6.6, 4 vCPU, RAM 7.8 GiB
**Node:** v26.9.0
**pnpm:** 10.34.5
**Database:** development seed
**Metode:** 10 iterasi per endpoint, diukur setelah login owner.

| Endpoint | Min (ms) | Median (ms) | p95 (ms) |
| --- | ---: | ---: | ---: |
| `/api/health` | 3.39 | 5.25 | 8.43 |
| `/api/products?pageSize=50` | 5.47 | 6.35 | 8.39 |
| `/api/orders?pageSize=50` | 6.42 | 7.96 | 9.61 |
| `/api/reports/summary?range=7d` | 21.24 | 24.24 | 27.56 |
| `/api/kds/orders` | 6.05 | 6.53 | 8.38 |

Ini baseline indikatif pada mesin development, bukan load test atau hasil hardware pilot. Jangan menetapkan SLA dari angka ini.

Jalankan ulang:

```bash
PERF_BASE_URL=http://127.0.0.1:3200 pnpm perf:baseline
```
