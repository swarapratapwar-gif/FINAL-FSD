const axios = require('axios');

async function test() {
  try {
    console.log('🔷 TEST: User Registration');
    const response = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password123'
    });
    console.log('✅ Success:', response.data);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

test();
