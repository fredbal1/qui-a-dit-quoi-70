
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync, writeFileSync, chmodSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

try {
  // Create .husky directory if it doesn't exist
  const huskyDir = join(projectRoot, '.husky');
  if (!existsSync(huskyDir)) {
    mkdirSync(huskyDir, { recursive: true });
  }

  // Create _/husky.sh
  const huskyUnderscoreDir = join(huskyDir, '_');
  if (!existsSync(huskyUnderscoreDir)) {
    mkdirSync(huskyUnderscoreDir, { recursive: true });
  }

  const huskyShContent = `#!/usr/bin/env sh
if [ -z "$husky_skip_init" ]; then
  debug () {
    if [ "$HUSKY_DEBUG" = "1" ]; then
      echo "husky (debug) - $1"
    fi
  }

  readonly hook_name="$(basename -- "$0")"
  debug "starting $hook_name..."

  if [ "$HUSKY" = "0" ]; then
    debug "HUSKY env variable is set to 0, skipping hook"
    exit 0
  fi

  if [ -f ~/.huskyrc ]; then
    debug "sourcing ~/.huskyrc"
    . ~/.huskyrc
  fi

  readonly husky_skip_init=1
  export husky_skip_init
  sh -e "$0" "$@"
fi
`;

  const huskyShPath = join(huskyUnderscoreDir, 'husky.sh');
  writeFileSync(huskyShPath, huskyShContent);
  chmodSync(huskyShPath, '755');

  console.log('✅ Husky setup completed successfully!');
} catch (error) {
  console.error('❌ Failed to setup Husky:', error.message);
  process.exit(1);
}
