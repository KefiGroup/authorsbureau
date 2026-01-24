import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { generateBlueprintContent } from './server/blueprint-generator.ts';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

// Get the blueprint
const [blueprints] = await connection.execute(
  'SELECT * FROM storyBlueprints WHERE id = 570003'
);

if (blueprints.length === 0) {
  console.log('❌ Blueprint not found');
  process.exit(1);
}

const blueprint = blueprints[0];

console.log('📊 Current Blueprint Data:');
console.log('   ID:', blueprint.id);
console.log('   Title:', blueprint.workingTitle);
console.log('   Target Pages:', blueprint.targetPages);
console.log('   Words Per Chapter:', blueprint.wordsPerChapter);
console.log('   Total Chapters:', blueprint.totalChapters);
console.log('');

console.log('🤖 Regenerating blueprint with GPT-4o...');

// Generate new blueprint content
const newContent = await generateBlueprintContent(blueprint, 'Kefi Group');

console.log('✅ Blueprint regenerated!');
console.log('');
console.log('📄 First 500 characters of new content:');
console.log(newContent.substring(0, 500));
console.log('...');
console.log('');

// Update database
const [result] = await connection.execute(
  'UPDATE storyBlueprints SET blueprintContent = ?, blueprintGenerated = 1 WHERE id = 570003',
  [newContent]
);

console.log('💾 Database updated');
console.log('   Rows affected:', result.affectedRows);
console.log('');
console.log('✅ Done! The blueprint now shows the correct word count with GPT-4o');

await connection.end();
