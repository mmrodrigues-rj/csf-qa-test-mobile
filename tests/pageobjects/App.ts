import * as fs from 'fs';
import * as path from 'path';
import { browser } from '@wdio/globals';

export class App {
  static async stepShot(name: string) {
    const b64 = await (browser as any).takeScreenshot();
    const outDir = path.resolve(__dirname, '..', '..', 'reports', 'steps');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const file = path.join(outDir, `${name.replace(/[^\w.-]+/g, '_')}.png`);
    fs.writeFileSync(file, Buffer.from(b64, 'base64'));
  }
}
