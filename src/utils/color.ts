/**
 * Conversion de couleurs pour le thème dynamique.
 *
 * Tailwind consomme les couleurs sous forme `hsl(var(--primary))`, où
 * `--primary` est un triplet nu : `30 60% 45%`. La base, elle, stocke une
 * couleur CSS complète (`hsl(30 60% 45%)`) ou un hexadécimal si l'admin a
 * utilisé un sélecteur de couleur. Ces fonctions font le pont.
 */

/** Triplet HSL sans la fonction englobante, ex. `30 60% 45%`. */
export type HslTriplet = string;

const HSL_RE = /^hsla?\(\s*([\d.]+)(?:deg)?[\s,]+([\d.]+)%[\s,]+([\d.]+)%/i;
const HEX_RE = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

function round(n: number, decimals = 1): number {
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
}

function hexToHsl(hex: string): HslTriplet | null {
  const match = HEX_RE.exec(hex.trim());
  if (!match) return null;

  let raw = match[1];
  if (raw.length === 3) raw = raw.split('').map((c) => c + c).join('');

  const r = parseInt(raw.slice(0, 2), 16) / 255;
  const g = parseInt(raw.slice(2, 4), 16) / 255;
  const b = parseInt(raw.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;

  let h = 0;
  let s = 0;

  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r:
        h = ((g - b) / d) % 6;
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }

  return `${round(h)} ${round(s * 100)}% ${round(l * 100)}%`;
}

/**
 * Normalise une couleur quelconque en triplet HSL exploitable par Tailwind.
 * Retourne `null` si l'entrée n'est pas reconnue — l'appelant garde alors sa
 * valeur par défaut plutôt que d'écrire une variable CSS invalide.
 */
export function toHslTriplet(input: string | undefined | null): HslTriplet | null {
  if (!input) return null;
  const value = input.trim();

  const hsl = HSL_RE.exec(value);
  if (hsl) return `${round(+hsl[1])} ${round(+hsl[2])}% ${round(+hsl[3])}%`;

  if (HEX_RE.test(value)) return hexToHsl(value);

  // Déjà sous forme de triplet nu ?
  if (/^[\d.]+\s+[\d.]+%\s+[\d.]+%$/.test(value)) return value;

  return null;
}

/** Composante linéarisée, selon la définition sRGB de la luminance relative. */
function linearize(channel: number): number {
  return channel <= 0.04045
    ? channel / 12.92
    : ((channel + 0.055) / 1.055) ** 2.4;
}

function hslTripletToRgb(triplet: HslTriplet): [number, number, number] {
  const [hRaw, sRaw, lRaw] = triplet.split(/\s+/);
  const h = parseFloat(hRaw) / 360;
  const s = parseFloat(sRaw) / 100;
  const l = parseFloat(lRaw) / 100;

  if (s === 0) return [l, l, l];

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  const toChannel = (t: number): number => {
    let v = t;
    if (v < 0) v += 1;
    if (v > 1) v -= 1;
    if (v < 1 / 6) return p + (q - p) * 6 * v;
    if (v < 1 / 2) return q;
    if (v < 2 / 3) return p + (q - p) * (2 / 3 - v) * 6;
    return p;
  };

  return [toChannel(h + 1 / 3), toChannel(h), toChannel(h - 1 / 3)];
}

function relativeLuminance(triplet: HslTriplet): number {
  const [r, g, b] = hslTripletToRgb(triplet);
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

/**
 * Couleur de texte lisible sur le fond donné.
 *
 * Un simple seuil sur la clarté HSL ne suffit pas : un jaune saturé à 50 % de
 * clarté est perçu bien plus lumineux qu'un bleu à la même valeur. On passe
 * donc par la luminance relative, celle qu'utilise le calcul de contraste WCAG.
 */
export function readableForeground(triplet: HslTriplet): HslTriplet {
  const luminance = relativeLuminance(triplet);
  const contrastWithWhite = 1.05 / (luminance + 0.05);
  const contrastWithBlack = (luminance + 0.05) / 0.05;
  return contrastWithWhite >= contrastWithBlack ? '0 0% 100%' : '0 0% 8%';
}