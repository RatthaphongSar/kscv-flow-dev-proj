import { api } from './src/utils/api.js';

// Test the API response directly
async function main() {
  try {
    const response = await fetch('http://localhost:4001/api/classes', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Authorization': 'Bearer mock-student-token'
      }
    });
    
    const data = await response.json();
    console.log('API Response for /api/classes:');
    console.log(JSON.stringify(data, null, 2));
    
  } catch (err) {
    console.error('Error:', err);
  }
}

main();
