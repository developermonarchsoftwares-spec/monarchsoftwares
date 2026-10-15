// Runs SiteOne Crawler against the site. Usage: npm run crawl [-- <extra crawler options>]   (local preview)
//                                                npm run crawl:live [-- <extra options>]      (production)
// Always runs with --no-cache (the crawler otherwise reuses 24h-old responses and reports stale results).
// Windows: uses the copy in tools/siteone-crawler (git-ignored). Elsewhere: a `siteone-crawler` on your PATH.
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [target = 'local', ...extra] = process.argv.slice(2);
const urls = { local: 'http://localhost:4173/', live: 'https://monarchsoftwares.com/' };
if (!urls[target]) { console.error('Unknown target "' + target + '" (use local or live)'); process.exit(1); }

const bundled = path.join(root, 'tools', 'siteone-crawler', process.platform === 'win32' ? 'siteone-crawler.exe' : 'siteone-crawler');
const bin = existsSync(bundled) ? bundled : 'siteone-crawler';
const res = spawnSync(bin, ['--url=' + urls[target], '--no-cache', ...extra], { stdio: 'inherit' });
if (res.error) {
    console.error('Could not start SiteOne Crawler (' + res.error.message + ').\nInstall it from https://github.com/janreges/siteone-crawler/releases');
    process.exit(1);
}
process.exit(res.status ?? 0);
