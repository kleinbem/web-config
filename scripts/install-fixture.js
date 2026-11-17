// Installs the package into fixture/node_modules from `npm pack`, so the fixture sees exactly
// the files a consumer gets and resolves them through `exports` and `$app/tsconfig`.
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const target = 'fixture/node_modules/@kleinbem/web-config';
const tmp = mkdtempSync(join(tmpdir(), 'web-config-pack-'));

try {
	const tarball = execFileSync('npm', ['pack', '--silent', '--pack-destination', tmp], { encoding: 'utf8' })
		.trim()
		.split('\n')
		.pop();
	rmSync(target, { recursive: true, force: true });
	mkdirSync(target, { recursive: true });
	execFileSync('tar', ['-xzf', join(tmp, String(tarball)), '-C', target, '--strip-components=1']);
} finally {
	rmSync(tmp, { recursive: true, force: true });
}
