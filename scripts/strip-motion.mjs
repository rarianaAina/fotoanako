#!/usr/bin/env node
/*
 * Retire les tics visuels hérités, sur l'ensemble de src/.
 *
 * Quatre gestes, tous mécaniques et donc automatisables sans risque de
 * jugement :
 *
 *   1. framer-motion — `<motion.div initial animate transition>` redevient
 *      `<div>`. L'apparition en fondu au défilement est le marqueur le plus
 *      reconnaissable d'une interface générée, et elle retarde la lecture.
 *
 *   2. `rounded-full` — la pastille par défaut. Le système est rectangulaire ;
 *      les rares formes rondes qui portent du sens sont réintroduites
 *      explicitement là où elles comptent.
 *
 *   3. `shadow-soft` / `shadow-glow` — déjà neutralisées par les jetons
 *      Tailwind, mais autant retirer les classes mortes.
 *
 *   4. `gradient-rose`, `bg-grid`, `text-balance` — définies dans l'ancien CSS
 *      critique de index.html, qui n'existe plus.
 *
 *   node scripts/strip-motion.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const MOTION_PROPS = [
  'initial', 'animate', 'exit', 'transition', 'whileInView', 'viewport',
  'whileHover', 'whileTap', 'whileFocus', 'layoutId', 'layout', 'variants',
];

const DEAD_CLASSES = [
  'gradient-rose', 'bg-grid', 'shadow-soft', 'shadow-glow', 'rounded-full',
  'backdrop-blur-xl', 'backdrop-blur',
];

/** Retire `prop={...}` en équilibrant les accolades — les valeurs sont imbriquées. */
function removeProp(src, prop) {
  const re = new RegExp(`\\s${prop}=\\{`, 'g');
  let out = src;
  for (;;) {
    re.lastIndex = 0;
    const m = re.exec(out);
    if (!m) break;
    let i = m.index + m[0].length;
    let depth = 1;
    while (i < out.length && depth > 0) {
      if (out[i] === '{') depth++;
      else if (out[i] === '}') depth--;
      i++;
    }
    out = out.slice(0, m.index) + out.slice(i);
  }
  // Variante chaîne : layoutId="nav"
  return out.replace(new RegExp(`\\s${prop}="[^"]*"`, 'g'), '');
}

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, files);
    else if (/\.tsx?$/.test(p)) files.push(p);
  }
  return files;
}

const stats = { motion: 0, classes: 0, sparkles: 0, files: 0 };

for (const file of walk('src')) {
  const original = readFileSync(file, 'utf8');
  let src = original;

  // 1. framer-motion
  if (src.includes('motion.')) {
    for (const prop of MOTION_PROPS) src = removeProp(src, prop);
    src = src.replace(/\{\.\.\.fadeUp\}\s*/g, '');
    src = src.replace(/<motion\.(\w+)/g, '<$1');
    src = src.replace(/<\/motion\.(\w+)>/g, '</$1>');
    stats.motion++;
  }
  src = src.replace(/<AnimatePresence[^>]*>\s*/g, '').replace(/\s*<\/AnimatePresence>/g, '');
  src = src.replace(/^import \{[^}]*\} from 'framer-motion';\n/gm, '');
  // La constante d'animation partagée n'a plus d'emploi.
  src = src.replace(/const fadeUp = \{[\s\S]*?\};\n\n?/g, '');

  // 2-4. classes mortes
  for (const cls of DEAD_CLASSES) {
    const before = src;
    src = src.replace(new RegExp(`(?<=["'\\s\`])${cls}(?=["'\\s\`])`, 'g'), '');
    if (src !== before) stats.classes++;
  }
  // Espaces laissés dans les className
  src = src.replace(/className="([^"]*)"/g, (_, c) => `className="${c.replace(/\s+/g, ' ').trim()}"`);
  src = src.replace(/className=""\s?/g, '');

  // Icône d'étincelles : décorative, jamais informative
  src = src.replace(/\s*<Sparkles[^/>]*\/>\s*/g, ' ');
  if (original.includes('Sparkles') && !src.includes('<Sparkles')) stats.sparkles++;

  if (src !== original) {
    writeFileSync(file, src);
    stats.files++;
  }
}

console.log(
  `${stats.files} fichiers modifiés — motion dans ${stats.motion}, ` +
  `étincelles retirées dans ${stats.sparkles}`,
);