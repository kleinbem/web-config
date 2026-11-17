// Copies the package into fixture/node_modules the way npm installs it for a consumer,
// so the fixture resolves it through `exports` and `$app/tsconfig` like a real app.
import { cpSync, mkdirSync, readFileSync, rmSync } from 'node:fs';

const { files } = JSON.parse(readFileSync('package.json', 'utf8'));
const target = 'fixture/node_modules/@kleinbem/web-config';

rmSync(target, { recursive: true, force: true });
mkdirSync(target, { recursive: true });
for (const entry of ['package.json', ...files]) {
	cpSync(entry, `${target}/${entry}`, { recursive: true });
}
