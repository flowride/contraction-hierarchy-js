import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class TestRunner {
  private tests: any[] = [];
  private passed: number = 0;
  private failed: number = 0;
  private currentSuite: string | null = null;

  async describe(suiteName: string, fn: () => Promise<void>): Promise<void> {
    this.currentSuite = suiteName;
    console.log(`\n📋 ${suiteName}`);
    await fn();
    this.currentSuite = null;
  }

  async it(testName: string, fn: () => Promise<void> | void): Promise<void> {
    try {
      await fn();
      this.passed++;
      console.log(`  ✅ ${testName}`);
    } catch (error: any) {
      this.failed++;
      console.log(`  ❌ ${testName}`);
      console.log(`     Error: ${error.message}`);
      if (error.stack) {
        console.log(`     Stack: ${error.stack.split('\n')[1]?.trim()}`);
      }
    }
  }

  assert(condition: boolean, message: string = 'Assertion failed'): void {
    if (!condition) {
      throw new Error(message);
    }
  }

  assertEqual(actual: any, expected: any, message: string = 'Values are not equal'): void {
    if (actual !== expected) {
      throw new Error(`${message}. Expected: ${expected}, Actual: ${actual}`);
    }
  }

  assertDeepEqual(actual: any, expected: any, message: string = 'Objects are not deeply equal'): void {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`${message}. Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)}`);
    }
  }

  assertThrows(fn: () => void, expectedError?: string, message: string = 'Function should throw'): void {
    try {
      fn();
      throw new Error(message);
    } catch (error: any) {
      if (expectedError && !error.message.includes(expectedError)) {
        throw new Error(`Expected error containing "${expectedError}", got: ${error.message}`);
      }
    }
  }

  summary(): void {
    console.log(`\n📊 Test Summary:`);
    console.log(`   ✅ Passed: ${this.passed}`);
    console.log(`   ❌ Failed: ${this.failed}`);
    console.log(`   📈 Total: ${this.passed + this.failed}`);
    
    if (this.failed > 0) {
      console.log(`\n💥 Some tests failed!`);
      process.exit(1);
    } else {
      console.log(`\n🎉 All tests passed!`);
    }
  }
}

// Create global test runner instance
const runner = new TestRunner();

// Export functions to global scope for test files
(global as any).describe = runner.describe.bind(runner);
(global as any).it = runner.it.bind(runner);
(global as any).assert = runner.assert.bind(runner);
(global as any).assertEqual = runner.assertEqual.bind(runner);
(global as any).assertDeepEqual = runner.assertDeepEqual.bind(runner);
(global as any).assertThrows = runner.assertThrows.bind(runner);

export default runner;
