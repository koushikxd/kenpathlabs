// Port and database are per checkout, so several worktrees can run the suite at once against the
// one Postgres container from packages/db/docker-compose.yml.
export const PORT = Number(process.env.E2E_PORT ?? 3100);
export const BASE_URL = `http://localhost:${PORT}`;

export const DB_NAME = process.env.E2E_DB ?? "kenpathlabs_e2e";
// Global setup drops this database, so a typo must never point it at the dev one.
if (!DB_NAME.includes("e2e")) throw new Error(`E2E_DB must contain "e2e", got "${DB_NAME}"`);

const SERVER = "postgresql://postgres:password@localhost:5432";
export const DATABASE_URL = `${SERVER}/${DB_NAME}`;
// Postgres' maintenance database, used to drop and create the test one.
export const ADMIN_URL = `${SERVER}/postgres`;

// The default server time for every test: Wednesday 14 Oct, in season 1, the third day since launch.
export const NOW = "2026-10-14T12:00:00+05:30";
