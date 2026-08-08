#!/usr/bin/env node
/*
 * Retire les imports devenus inutilisés, d'après le compilateur TypeScript.
 *
 * Utile pendant une refonte visuelle : chaque composant retiré d'un écran
 * laisse derrière lui un import mort que `tsc` signale mais ne corrige pas.
 * Le faire à la main sur cinquante fichiers est mécanique et fautif.
 *
 * Ne touche qu'aux noms nommément signalés en TS6133 sur une ligne d'import :
 * les variables locales inutilisées, elles, méritent qu'on les regarde.
 *
 *   node scripts/prune-imports.mjs
 */
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

function diagnostics() {
  try {
    execSync('npx tsc --noEmit -p tsconfig.app.json', { encoding: 'utf8', stdio: 'pipe' });
    return [];
  } catch (e) {
    return (e.stdout || '').split('\n');
  }
}

let totalRemoved = 0;

// Plusieurs passes : retirer un import peut en rendre un autre inutile.
for (let pass = 0; pass < 5; pass++) {
  const unused = new Map(); // fichier -> Set de noms

  for (const line of diagnostics()) {
    const m = /^(.+?)\((\d+),\d+\): error TS6133: '(.+?)' is declared but its value is never read/.exec(line);
    if (!m) continue;
    const [, file, lineNo, name] = m;
    const source = readFileSync(file, 'utf8').split('\n')[Number(lineNo) - 1] ?? '';
    if (!/^\s*import\b/.test(source)) continue; // pas un import : on laisse
    if (!unused.has(file)) unused.set(file, new Set());
    unused.get(file).add(name);
  }

  if (unused.size === 0) break;

  for (const [file, names] of unused) {
    let src = readFileSync(file, 'utf8');

    for (const name of names) {
      // Membre d'une liste d'imports nommés
      src = src.replace(
        new RegExp(`(import\\s*(?:type\\s*)?\\{[^}]*?)\\b${name}\\b\\s*,?\\s*`, 'g'),
        '$1',
      );
      // Import par défaut isolé
      src = src.replace(new RegExp(`^import\\s+${name}\\s+from\\s+['"][^'"]+['"];\\n`, 'gm'), '');
      totalRemoved++;
    }

    // Nettoyage : virgules orphelines et listes vidées
    src = src.replace(/\{\s*,/g, '{').replace(/,\s*\}/g, ' }').replace(/,\s*,/g, ',');
    src = src.replace(/^import\s*(?:type\s*)?\{\s*\}\s*from\s*['"][^'"]+['"];\n/gm, '');

    writeFileSync(file, src);
  }
}

console.log(
  totalRemoved === 0 ? 'Aucun import inutilisé.' : `${totalRemoved} import(s) retiré(s).`,
);