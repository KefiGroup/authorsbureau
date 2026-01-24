import fs from 'fs';
import https from 'https';

// Make POST request to download manuscript
const postData = JSON.stringify({
  "0": {
    "json": {
      "blueprintId": 510001
    }
  }
});

const options = {
  hostname: '3000-i0xfb8c4ymhb3z60bjcvt-fc8d4c11.sg1.manus.computer',
  port: 443,
  path: '/api/trpc/manuscript.downloadManuscript?batch=1',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': postData.length,
    'Cookie': 'session=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTczNzc0NTY1NCwiZXhwIjoxNzM4MzUwNDU0fQ.hJBRzP4x3Uy3OBvdCgOGUdTyHXbPxlEPMjGg3r9Xt9I'
  }
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', async () => {
    try {
      const response = JSON.parse(data);
      const result = response[0].result.data;
      
      console.log('Download URL:', result.url);
      console.log('Filename:', result.fileName);
      console.log('Section count:', result.sectionCount);
      
      // Download the file from S3
      const fileResponse = await fetch(result.url);
      const buffer = await fileResponse.arrayBuffer();
      
      const filePath = '/home/ubuntu/authors-bureau-v2/test-manuscript.docx';
      fs.writeFileSync(filePath, Buffer.from(buffer));
      
      console.log('File downloaded to:', filePath);
      console.log('File size:', buffer.byteLength, 'bytes');
      console.log('File size (MB):', (buffer.byteLength / 1024 / 1024).toFixed(2));
      
    } catch (error) {
      console.error('Error:', error.message);
      console.error('Response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
});

req.write(postData);
req.end();
