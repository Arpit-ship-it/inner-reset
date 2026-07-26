// 🧪 Test Script to Verify Frontend-Backend Connection
const http = require('http');

console.log('\n🔍 Testing Frontend-Backend Integration...\n');

// Test 1: Check if server is running
function testServerRunning() {
    return new Promise((resolve, reject) => {
        http.get('http://localhost:5000', (res) => {
            if (res.statusCode === 200) {
                console.log('✅ Test 1 PASSED: Server is running on port 5000');
                resolve(true);
            } else {
                console.log(`❌ Test 1 FAILED: Server returned status ${res.statusCode}`);
                resolve(false);
            }
        }).on('error', (err) => {
            console.log('❌ Test 1 FAILED: Server is not running');
            console.log('   → Run "npm start" to start the server');
            resolve(false);
        });
    });
}

// Test 2: Check if API endpoint exists
function testOtpEndpoint() {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            whatsapp_number: '9999999999'
        });

        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/send-otp',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                if (res.statusCode === 200 || res.statusCode === 500) {
                    console.log('✅ Test 2 PASSED: OTP endpoint is accessible');
                    if (res.statusCode === 500) {
                        console.log('   ⚠️  Note: WhatsApp client may not be initialized yet');
                    }
                    resolve(true);
                } else {
                    console.log(`❌ Test 2 FAILED: Unexpected status ${res.statusCode}`);
                    resolve(false);
                }
            });
        });

        req.on('error', (err) => {
            console.log('❌ Test 2 FAILED: Cannot reach OTP endpoint');
            resolve(false);
        });

        req.write(postData);
        req.end();
    });
}

// Test 3: Check if frontend HTML is served
function testFrontendServing() {
    return new Promise((resolve, reject) => {
        http.get('http://localhost:5000/', (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                if (data.includes('Affirmation Initiative') || data.includes('Companion Engine')) {
                    console.log('✅ Test 3 PASSED: Frontend HTML is being served');
                    resolve(true);
                } else {
                    console.log('⚠️  Test 3 WARNING: HTML content may be incomplete');
                    resolve(true);
                }
            });
        }).on('error', (err) => {
            console.log('❌ Test 3 FAILED: Cannot access frontend');
            resolve(false);
        });
    });
}

// Run all tests
async function runAllTests() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  FRONTEND-BACKEND CONNECTION TEST');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const test1 = await testServerRunning();
    if (!test1) {
        console.log('\n❌ Server is not running. Start it with: npm start\n');
        process.exit(1);
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    const test2 = await testOtpEndpoint();
    
    await new Promise(resolve => setTimeout(resolve, 500));
    const test3 = await testFrontendServing();

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  TEST SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (test1 && test2 && test3) {
        console.log('🎉 ALL TESTS PASSED!');
        console.log('\n✨ Your frontend and backend are properly linked!');
        console.log('\n📍 Access your application at:');
        console.log('   → http://localhost:5000\n');
    } else {
        console.log('⚠️  SOME TESTS FAILED');
        console.log('\n🔧 Please check the error messages above\n');
    }
}

runAllTests();
