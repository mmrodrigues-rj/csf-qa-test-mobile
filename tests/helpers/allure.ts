import { browser } from '@wdio/globals';
import * as fs from 'fs';
import * as path from 'path';

export async function step(title: string, fn: () => Promise<void> | void) {
  // wrapper simples: log + screenshot ao final do step
  await Promise.resolve(fn());
  const b64 = await (browser as any).takeScreenshot();
  const outDir = path.resolve(__dirname, '..', '..', 'reports', 'steps');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const file = path.join(outDir, `${title.replace(/[^\w.-]+/g, '_')}.png`);
  fs.writeFileSync(file, Buffer.from(b64, 'base64'));
}
