import { createCaller } from './server/_core/trpc-server.js';

// Mock context with user info
const mockContext = {
  user: {
    id: 1,
    name: "Pauline Teo",
    email: "paulinet77@gmail.com",
    role: "user"
  }
};

async function testDownload() {
  try {
    const caller = createCaller(mockContext);
    const result = await caller.manuscript.downloadManuscript({ blueprintId: 510001 });
    
    console.log("Download successful!");
    console.log("URL:", result.url);
    console.log("Filename:", result.fileName);
    console.log("Section count:", result.sectionCount);
    
    // Download the file
    const response = await fetch(result.url);
    const buffer = await response.arrayBuffer();
    
    console.log("File size:", buffer.byteLength, "bytes");
    console.log("File size (MB):", (buffer.byteLength / 1024 / 1024).toFixed(2));
    
    // Save to local file
    const fs = await import('fs');
    const filePath = `/home/ubuntu/authors-bureau-v2/test-manuscript.docx`;
    fs.writeFileSync(filePath, Buffer.from(buffer));
    console.log("Saved to:", filePath);
    
  } catch (error) {
    console.error("Error:", error.message);
    console.error(error.stack);
  }
}

testDownload();
