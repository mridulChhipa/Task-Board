import { execSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const suite = process.argv[2];
if (suite !== 'unit' && suite !== 'integration') {
  console.error('Usage: tsx tests/run.ts <unit|integration>');
  process.exit(1);
}

const suiteDir = join(__dirname, suite);
const files = readdirSync(suiteDir).filter(
  (file) => file.endsWith('.test.ts') && !file.startsWith('.'),
);

console.log(`Found ${files.length} ${suite} test files to run:`);
files.forEach((f) => console.log(`- ${f}`));
console.log('\n=======================================\n');

let hasFailures = false;

for (const file of files) {
  const filePath = join(suiteDir, file);
  console.log(`Running \x1b[36m${file}\x1b[0m...`);

  try {
    execSync(`tsx --test "${filePath}"`, {
      stdio: 'inherit',
      cwd: join(__dirname, '..'),
    });
    console.log(`\x1b[32m✔ ${file} passed.\x1b[0m\n`);
  } catch (error) {
    console.error(`\x1b[31m✖ ${file} failed.\x1b[0m\n`, error);
    hasFailures = true;
  }
}

if (hasFailures) {
  console.error('\x1b[31mSome tests failed. See output above.\x1b[0m');
  process.exit(1);
} else {
  console.log('\x1b[32mAll test files passed successfully!\x1b[0m');
  process.exit(0);
}
