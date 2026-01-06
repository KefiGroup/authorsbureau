import { generateExportBundle } from './server/export-bundle.ts';
import fs from 'fs';

// Create a small test data URL (1x1 red pixel PNG)
const testDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

async function test() {
  console.log('Testing export bundle with data URL cover...\n');

  try {
    const result = await generateExportBundle({
    bookTitle: 'Test Book with Data URL Cover',
    authorName: 'Test Author',
    manuscriptContent: 'This is a test manuscript with multiple paragraphs.\n\nChapter 1: Introduction\n\nThis is the first chapter of our test book.',
    coverImageUrl: testDataUrl,
    metadata: {
      title: 'Test Book',
      subtitle: 'A Test Subtitle',
      description: 'This is a test book description for testing the export bundle functionality.',
      categories: ['Books > Self-Help', 'Books > Business'],
      keywords: ['test', 'book', 'export', 'bundle'],
      price: '$9.99',
      genre: 'Self-Help'
    },
    isbn: '978-1234567890'
  });

    console.log('✅ SUCCESS! Export bundle generated successfully.');
    console.log('\nResult:');
    console.log('- ZIP URL:', result.zipUrl);
    console.log('- ZIP Key:', result.zipKey);
    console.log('- Files included:', Object.keys(result.files).filter(k => result.files[k]).join(', '));
    console.log('- Created at:', new Date(result.createdAt).toISOString());
    
    console.log('\n🎉 The fix works! Data URL covers are now handled correctly.');
    
  } catch (error) {
    console.error('❌ FAILED! Error generating export bundle:');
    console.error(error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

test();
