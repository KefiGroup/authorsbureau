import Database from 'better-sqlite3';

const db = new Database(process.env.DATABASE_URL?.replace('file:', '') || './local.db');

const blueprint = db.prepare('SELECT id, conversationMode, blueprintGenerated, essentialData, conversationHistory FROM storyBlueprints WHERE id = 60007').get();

console.log('Blueprint 60007 Status:');
console.log('- conversationMode:', blueprint?.conversationMode);
console.log('- blueprintGenerated:', blueprint?.blueprintGenerated);
console.log('- essentialData:', blueprint?.essentialData ? JSON.parse(blueprint.essentialData) : null);
console.log('- conversationHistory length:', blueprint?.conversationHistory ? JSON.parse(blueprint.conversationHistory).length : 0);

db.close();
