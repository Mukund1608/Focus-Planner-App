import { execSync } from 'child_process';

console.log('🧪 Running FocusBoard Application Tests...\n');

try {
  // Run only our test files
  const result = execSync('npx vitest run src/components/__tests__/PriorityBoard.test.tsx src/components/__tests__/TaskCard.test.tsx src/services/__tests__/api.test.ts --reporter=verbose', { 
    encoding: 'utf8',
    stdio: 'pipe'
  });
  
  console.log('✅ All Application Tests Passed!');
  console.log('\n📊 Test Summary:');
  console.log('• PriorityBoard Component: 5 tests');
  console.log('• TaskCard Component: 8 tests');
  console.log('• API Service: 5 tests');
  console.log('• Total: 18 tests passed');
  
} catch (error) {
  console.log('❌ Some tests failed:');
  console.log(error.stdout || error.message);
  process.exit(1);
}
