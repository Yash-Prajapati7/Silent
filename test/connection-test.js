import { apiService } from '../src/services/api.js';

async function testFrontendBackendConnection() {
  console.log('🔗 Testing Frontend-Backend Connection...\n');

  try {
    // Test health check
    console.log('1️⃣ Testing health check...');
    const health = await apiService.healthCheck();
    console.log('✅ Health check passed:', health.message);

    // Test random names
    console.log('\n2️⃣ Testing random names...');
    const names = await apiService.getRandomNames(3);
    console.log('✅ Random names:', names.names);

    console.log('\n🎉 Frontend-Backend connection is working properly!');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testFrontendBackendConnection();
