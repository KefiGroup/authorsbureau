import Database from 'better-sqlite3';

const db = new Database(process.env.DATABASE_URL?.replace('file:', '') || './local.db');

// Delete test blueprints from previous sessions
const result = db.prepare('DELETE FROM storyBlueprints WHERE id IN (60002, 60003, 60005, 60006)').run();
console.log(`Deleted ${result.changes} test blueprints`);

db.close();
