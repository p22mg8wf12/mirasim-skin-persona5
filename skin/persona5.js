/* mirasim-skin-persona5 — single-theme toggle (Alt+Shift+K). */
(function(){var KEY="mirasim-skin.persona5";
function on(){try{return localStorage.getItem(KEY)!=="off";}catch(e){return true;}}
function apply(v){var el=document.documentElement;if(v)el.setAttribute("data-skin","persona5");else el.removeAttribute("data-skin");}
apply(on());
window.addEventListener("keydown",function(e){if(!e.altKey||!e.shiftKey||e.metaKey||e.ctrlKey)return;if(e.code!=="KeyK")return;e.preventDefault();e.stopPropagation();var n=on()?"off":"on";try{localStorage.setItem(KEY,n);}catch(x){}apply(n==="on");},true);
window.__mirasimSkin=function(v){try{localStorage.setItem(KEY,v==="off"?"off":"on");}catch(x){}apply(v!=="off");};})();

;try{
/* Mirasim skin FX layer — 怪盗 / Phantom (Persona 5–inspired) v3.
   A fixed, pointer-events:none overlay carrying the whole show:
     - diagonal red shard-beams + razor hairline, breathing bloom
     - torn shard corners, slammed in with overshoot
     - THE MASK: an angular white domino mask over a double
       mis-registered splat — halftone ring, marching ants
     - THE PHONE: a tilted handset watermark, jagged red screen,
       floating in the lower-left wing
     - drifting star/shard particles + a rare shooting star
     - click burst: white flash → red splat → dashed ring → four
       flying shards (1-in-8: a mini calling card spins out)
     - the calling card: slams in when the skin engages, tears in
       half and exits (Alt+Shift+K re-triggers it)
     - a slanted date tag bottom-right (Alt+Shift+U hides it)
     - Alt+Shift+S: showtime — crossed slash sweep + burst volley
   All artwork is original geometry drawn in code: genre motifs
   (domino mask, handset, stars), no official marks, no character
   art, no game assets, no bitmaps.
   Honors prefers-reduced-motion and the app's data-anim-paused. */
(function () {
  "use strict";
  var ID = "mirasim-skin-fx";
  var NS = "http://www.w3.org/2000/svg";

  var INK = "#060406";
  var RED = "#ec0a2e";
  var RED_HOT = "#ff2442";
  var DEEP = "#a30722";
  var WHITE = "#fbf7f4";

  /* Deterministic PRNG (mulberry32) so bursts render identically. */
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---------- geometry helpers ---------------------------------- */

  /* Chunky splash: few decisive facets cut at irregular angles —
     construction paper attacked with scissors, not a sea urchin.
     8–11 outer points, shallow notches between them, the odd long
     shout-spike. Drawn around (0,0); place with translate/scale so
     the same silhouette can be layered rim → gap → body. */
  function splashPath(r, seed) {
    var rr = rng(seed), i, n = 8 + Math.floor(rr() * 4), w = [], sum = 0;
    for (i = 0; i < n; i++) { w[i] = 0.45 + rr(); sum += w[i]; }
    var a = -Math.PI / 2 + rr() * 0.8, pts = [];
    for (i = 0; i < n; i++) {
      var step = (w[i] / sum) * Math.PI * 2;
      var R = r * (rr() < 0.16 ? 1.24 : 0.68 + rr() * 0.32);
      pts.push((Math.cos(a) * R).toFixed(1) + " " + (Math.sin(a) * R).toFixed(1));
      var aN = a + step * (0.36 + rr() * 0.26);
      var RN = R * (0.58 + rr() * 0.24);
      pts.push((Math.cos(aN) * RN).toFixed(1) + " " + (Math.sin(aN) * RN).toFixed(1));
      a += step;
    }
    return "M" + pts.join(" L") + " Z";
  }

  /* Rim → gap → body: red silhouette widest, white behind it,
     ink body on top. The calling-card banner treatment. */
  function layeredSplash(x, y, r, seed, spin) {
    var p = splashPath(r, seed);
    var g = 'translate(' + x + ' ' + y + ')';
    return (
      '<g transform="' + g + ' rotate(' + (spin || 0) + ')">' +
      '<path d="' + p + '" fill="' + RED + '" transform="scale(1.1) translate(3 4)"/>' +
      '<path d="' + p + '" fill="' + WHITE + '" transform="scale(1.045)"/>' +
      '<path d="' + p + '" fill="' + INK + '"/>' +
      "</g>"
    );
  }

  function starN(cx, cy, points, rOut, rIn, tilt) {
    var pts = [], i, a, n = points * 2;
    for (i = 0; i < n; i++) {
      a = (i * Math.PI) / points - Math.PI / 2 + (tilt || 0);
      var rad = i % 2 === 0 ? rOut : rIn;
      pts.push((cx + Math.cos(a) * rad).toFixed(2) + " " + (cy + Math.sin(a) * rad).toFixed(2));
    }
    return "M" + pts.join(" L") + " Z";
  }
  function star5(cx, cy, rOut, rIn, tilt) { return starN(cx, cy, 5, rOut, rIn, tilt); }

  /* torn-edge rectangle (the calling card) */
  function tornRect(x0, y0, x1, y1, step, amp, seed) {
    var r = rng(seed), pts = [], t;
    function edge(ax, ay, bx, by) {
      var n = Math.max(2, Math.round(Math.hypot(bx - ax, by - ay) / step)), i;
      for (i = 0; i < n; i++) {
        t = i / n;
        var px = ax + (bx - ax) * t, py = ay + (by - ay) * t;
        var nx = (by - ay) ? (by > ay ? 1 : -1) : 0, ny = (bx - ax) ? (bx > ax ? -1 : 1) : 0;
        pts.push((px + (ny ? 0 : nx * (r() - 0.5) * amp)).toFixed(1) + " " +
                 (py + (nx ? 0 : ny * (r() - 0.5) * amp)).toFixed(1));
      }
    }
    edge(x0, y0, x1, y0); edge(x1, y0, x1, y1); edge(x1, y1, x0, y1); edge(x0, y1, x0, y0);
    return "M" + pts.join(" L") + " Z";
  }

  /* the mask, drawn once, reused everywhere: sharp winged domino,
     almond eye slits (evenodd), original path */
  function maskPath(dx, dy, s) {
    function p(x, y) { return (dx + x * s).toFixed(1) + " " + (dy + y * s).toFixed(1); }
    return (
      "M" + p(0, 34) +
      " L" + p(14, 16) +
      " C" + p(38, -2) + " " + p(74, -6) + " " + p(100, 12) +
      " C" + p(126, -6) + " " + p(162, -2) + " " + p(186, 16) +
      " L" + p(200, 34) +
      " L" + p(178, 38) +
      " C" + p(170, 62) + " " + p(140, 70) + " " + p(112, 52) +
      " C" + p(108, 55) + " " + p(92, 55) + " " + p(88, 52) +
      " C" + p(60, 70) + " " + p(30, 62) + " " + p(22, 38) + " Z" +
      " M" + p(46, 30) +
      " C" + p(58, 18) + " " + p(80, 20) + " " + p(86, 32) +
      " C" + p(76, 44) + " " + p(52, 42) + " " + p(46, 30) + " Z" +
      " M" + p(114, 32) +
      " C" + p(120, 20) + " " + p(142, 18) + " " + p(154, 30) +
      " C" + p(148, 42) + " " + p(124, 44) + " " + p(114, 32) + " Z"
    );
  }

  var DEFS =
    "<defs>" +
    '<pattern id="p5HalfP" width="7" height="7" patternUnits="userSpaceOnUse">' +
    '<circle cx="2" cy="2" r="1.05" fill="' + WHITE + '"/></pattern>' +
    "</defs>";

  /* ---------- the emblem: THE MASK on a chunky splash -------------- */
  function emblemSVG(size) {
    var s = "";

    // counter-rotating chunky splashes: red rim, white gap, ink body
    s += '<g class="p5SpikesB"><g transform="translate(130 130)">' +
         '<path d="' + splashPath(118, 11) + '" fill="' + RED + '" transform="translate(4 6)"/>' +
         '<path d="' + splashPath(118, 11) + '" fill="' + DEEP + '" transform="scale(.92)" opacity=".9"/>' +
         "</g></g>";
    s += '<g class="p5Spikes">' + layeredSplash(130, 130, 96, 47, 0) + "</g>";

    // halftone ring + marching ants
    s += '<circle cx="130" cy="130" r="88" fill="none" stroke="url(#p5HalfP)" stroke-width="11" opacity=".4"/>';
    s += '<circle class="p5Ants" cx="130" cy="130" r="64" fill="none" stroke="' + WHITE +
         '" stroke-width="1.5" stroke-dasharray="5 8" opacity=".9"/>';

    // the slash behind the mask
    s += '<g transform="rotate(-24 130 130)">' +
         '<rect x="6" y="120" width="248" height="2.6" fill="' + WHITE + '" opacity=".9"/>' +
         '<rect x="6" y="124" width="248" height="1.1" fill="' + RED_HOT + '" opacity=".85"/>' +
         "</g>";

    // THE MASK — deep red drop shard, then the white face
    s += '<g transform="rotate(-9 130 128)">' +
         '<path fill-rule="evenodd" d="' + maskPath(34, 106, 0.96) + '" fill="' + DEEP + '" opacity=".9"/>' +
         '<path fill-rule="evenodd" d="' + maskPath(30, 102, 0.96) + '" fill="' + WHITE +
         '" stroke="' + INK + '" stroke-width="2"/>' +
         "</g>";

    // a star riding the right wing tip + a red wink left
    s += '<path d="' + star5(206, 96, 12, 5, 0.35) + '" fill="' + WHITE + '"/>';
    s += '<path d="' + star5(52, 84, 7, 3, -0.2) + '" fill="' + RED_HOT + '"/>';

    // splatter slivers thrown off the burst
    s += '<path d="M28 176 L64 160 L46 172 L84 158 L58 176 Z" fill="' + RED + '" opacity=".9"/>';
    s += '<path d="M206 186 L228 176 L214 188 L232 194 Z" fill="' + WHITE + '" opacity=".6"/>';

    return '<svg viewBox="0 0 260 260" width="' + size + '" height="' + size +
           '" xmlns="' + NS + '">' + DEFS + s + "</svg>";
  }

  /* ---------- the phone: tilted handset, jagged red screen --------- */
  function phoneSVG(w) {
    var s = "";
    // deep drop shard
    s += '<rect x="18" y="16" width="118" height="230" fill="' + DEEP + '" opacity=".85" transform="rotate(-2 77 131)"/>';
    // body
    s += '<rect x="10" y="8" width="118" height="230" fill="' + INK + '" stroke="' + WHITE + '" stroke-width="4"/>';
    // screen: red field with a black tear across it
    s += '<rect x="22" y="34" width="94" height="178" fill="' + RED + '"/>';
    s += '<path d="M22 96 L52 84 L44 104 L76 92 L68 112 L116 98 L116 128 L84 138 L92 120 L58 132 L66 114 L22 126 Z" fill="' + INK + '"/>';
    // status hairlines
    s += '<rect x="22" y="24" width="30" height="3" fill="' + WHITE + '" opacity=".8"/>';
    s += '<rect x="96" y="24" width="20" height="3" fill="' + WHITE + '" opacity=".8"/>';
    // the eye of the nav — a star in a dashed ring
    s += '<circle cx="69" cy="66" r="17" fill="none" stroke="' + WHITE + '" stroke-width="1.6" stroke-dasharray="4 5"/>';
    s += '<path d="' + star5(69, 66, 12, 5, 0.3) + '" fill="' + WHITE + '"/>';
    // jagged menu bars
    s += '<path d="M28 152 L96 148 L94 162 L26 166 Z" fill="' + WHITE + '"/>';
    s += '<path d="M32 172 L108 168 L106 182 L30 186 Z" fill="' + WHITE + '" opacity=".75"/>';
    s += '<path d="M28 192 L88 189 L86 202 L26 205 Z" fill="' + WHITE + '" opacity=".5"/>';
    // home slit
    s += '<rect x="56" y="222" width="28" height="4" fill="' + WHITE + '" opacity=".85"/>';
    // a spark leaving the corner
    s += '<path d="' + star5(126, 20, 9, 3.8, 0.4) + '" fill="' + RED_HOT + '"/>';
    return '<svg viewBox="0 0 146 254" width="' + w + '" xmlns="' + NS + '">' + s + "</svg>";
  }

  /* ---------- corner shard: rim → gap → body, big decisive cuts ---- */
  function cornerSVG() {
    // one silhouette, three nested scales anchored at the corner (0,0)
    var P = "M0 0 L138 0 L120 22 L128 38 L86 34 L74 58 L44 50 L50 82 L22 74 L26 104 L0 96 Z";
    return (
      '<svg viewBox="0 0 220 220" xmlns="' + NS + '">' +
      '<path d="' + P + '" fill="' + RED + '" transform="scale(1.22)"/>' +
      '<path d="' + P + '" fill="' + WHITE + '" transform="scale(1.1)"/>' +
      '<path d="' + P + '" fill="' + INK + '"/>' +
      '<path d="M118 6 L92 30" stroke="' + WHITE + '" stroke-width="2.4" opacity=".9"/>' +
      '<path d="M56 8 L32 32" stroke="' + WHITE + '" stroke-width="1.4" opacity=".6"/>' +
      '<path d="M4 4 H 66" stroke="' + RED_HOT + '" stroke-width="3" opacity=".95"/>' +
      '<path d="M4 4 V 46" stroke="' + RED_HOT + '" stroke-width="3" opacity=".95"/>' +
      '<g fill="' + WHITE + '" opacity=".85">' +
      '<circle cx="84" cy="46" r="2"/><circle cx="95" cy="39" r="1.5"/>' +
      '<circle cx="74" cy="54" r="1.2"/></g>' +
      '<path d="' + star5(148, 30, 11, 4.6, 0.5) + '" fill="' + WHITE + '"/>' +
      '<path d="' + star5(40, 92, 6.5, 2.7, -0.4) + '" fill="' + RED_HOT + '"/>' +
      "</svg>"
    );
  }

  /* ---------- particles ------------------------------------------ */
  function starSVG(sz, color, hollow) {
    var p = star5(12, 12, 11, 4.4, 0);
    return '<svg viewBox="0 0 24 24" width="' + sz + '" height="' + sz + '" xmlns="' + NS + '">' +
      (hollow ? '<path d="' + p + '" fill="none" stroke="' + color + '" stroke-width="1.6"/>'
              : '<path d="' + p + '" fill="' + color + '"/>') + "</svg>";
  }
  function maskMiniSVG(sz, color) {
    return '<svg viewBox="0 0 24 24" width="' + (sz * 1.5).toFixed(0) + '" height="' + sz + '" preserveAspectRatio="none" xmlns="' + NS + '">' +
      '<path fill-rule="evenodd" d="' + maskPath(1, 6, 0.11) + '" fill="' + color + '"/></svg>';
  }
  function shardSVG(sz, color) {
    return '<svg viewBox="0 0 24 24" width="' + sz + '" height="' + sz + '" xmlns="' + NS + '">' +
      '<path d="M3 21 L21 3 L17 14 L9 19 Z" fill="' + color + '"/></svg>';
  }
  /* concentric menu-backdrop rings, one segmented ring turning */
  function ringsSVG() {
    var s = "", r;
    for (r = 150; r <= 560; r += 62) {
      s += '<circle cx="600" cy="600" r="' + r + '" fill="none" stroke="' + WHITE +
           '" stroke-width="2" opacity="' + (r % 124 === 26 ? ".7" : ".45") + '"/>';
    }
    s += '<g class="p5RingsSpin">' +
         '<circle cx="600" cy="600" r="404" fill="none" stroke="' + WHITE +
         '" stroke-width="7" stroke-dasharray="52 34" opacity=".55"/>' +
         '<circle cx="600" cy="600" r="252" fill="none" stroke="' + RED_HOT +
         '" stroke-width="4" stroke-dasharray="180 460" opacity=".8"/></g>';
    return '<svg viewBox="0 0 1200 1200" xmlns="' + NS + '">' + s + "</svg>";
  }

  function cometSVG(len) {
    return '<svg viewBox="0 0 ' + (len + 26) + ' 26" width="' + (len + 26) + '" height="26" xmlns="' + NS + '">' +
      '<defs><linearGradient id="p5CmT" x1="1" y1="0" x2="0" y2="0">' +
      '<stop offset="0" stop-color="' + WHITE + '" stop-opacity=".95"/>' +
      '<stop offset=".4" stop-color="' + RED_HOT + '" stop-opacity=".45"/>' +
      '<stop offset="1" stop-color="' + RED + '" stop-opacity="0"/></linearGradient></defs>' +
      '<rect x="0" y="11.4" width="' + len + '" height="2.2" fill="url(#p5CmT)"/>' +
      '<path d="' + star5(len + 12, 13, 10, 4.2, 0.3) + '" fill="' + WHITE + '"/></svg>';
  }

  /* ---------- click burst: a shout-bubble slamming shut ------------- */
  function clickSVG(seed) {
    var r = rng(seed), s = "";
    s += '<circle class="ckRing" cx="75" cy="75" r="34" fill="none" stroke="' + WHITE +
         '" stroke-width="1.7" stroke-dasharray="5 7"/>';
    // chunky bubble: red rim, white gap, ink body + comic tail
    var tailA = (r() * 360).toFixed(0);
    s += '<g class="ckSplat" style="--ca:' + (r() * 30 - 22).toFixed(0) + 'deg">' +
         '<g transform="rotate(' + tailA + ' 75 75)">' +
         '<path d="M75 75 L64 128 L88 84 Z" fill="' + RED + '"/>' +
         '<path d="M75 75 L67 118 L86 84 Z" fill="' + WHITE + '"/>' +
         '<path d="M75 75 L70 110 L84 83 Z" fill="' + INK + '"/></g>' +
         layeredSplash(75, 75, 42, seed, (r() * 40 - 20).toFixed(0)) +
         '<path d="' + star5(75, 75, 15, 6.2, 0.3) + '" fill="' + WHITE + '"/>' +
         "</g>";
    s += '<path class="ckFlash" d="' + starN(75, 75, 4, 46, 5.5, 0.12) + '" fill="' + WHITE + '"/>';
    var i, a, d;
    for (i = 0; i < 4; i++) {
      a = r() * Math.PI * 2; d = 46 + r() * 30;
      s += '<path class="ckShard" style="--dx:' + (Math.cos(a) * d).toFixed(0) + "px;--dy:" +
           (Math.sin(a) * d).toFixed(0) + "px;--rr:" + (r() * 260 - 130).toFixed(0) + 'deg" d="M73 71 L84 66 L78 72 L86 74 L74 77 Z" ' +
           'fill="' + (i % 2 ? WHITE : RED_HOT) + '" transform="rotate(' + (a * 57.3).toFixed(0) + ' 75 75)"/>';
    }
    if (Math.floor(r() * 8) === 3) {
      s += '<g class="ckCard"><rect x="64" y="58" width="24" height="33" fill="' + RED +
           '" stroke="' + WHITE + '" stroke-width="2" transform="rotate(-7 76 74)"/>' +
           '<path fill-rule="evenodd" d="' + maskPath(65, 66, 0.11) + '" fill="' + WHITE + '"/>' +
           '<rect x="69" y="80" width="14" height="2" fill="' + WHITE + '" opacity=".9"/>' +
           '<rect x="69" y="84" width="10" height="2" fill="' + WHITE + '" opacity=".65"/></g>';
    }
    return '<svg viewBox="0 0 150 150" xmlns="' + NS + '">' + s + "</svg>";
  }

  /* ---------- the calling card: chunky tears, ransom headline -------- */
  function cardSVG() {
    var W = 360, H = 230, s = "";
    var body = tornRect(18, 16, W - 16, H - 14, 34, 20, 5);
    s += '<path d="' + body + '" fill="' + INK + '" transform="translate(11 12)"/>';
    s += '<path d="' + body + '" fill="#e60024" stroke="' + WHITE + '" stroke-width="4.5"/>';
    s += '<path d="' + tornRect(32, 30, W - 30, H - 28, 30, 11, 9) + '" fill="none" stroke="' + WHITE +
         '" stroke-width="1.5" stroke-dasharray="6 6"/>';
    // comic tail biting out of the lower-left tear
    s += '<g transform="rotate(14 40 206)">' +
         '<path d="M52 196 L18 236 L74 210 Z" fill="' + WHITE + '"/>' +
         '<path d="M52 198 L28 226 L70 208 Z" fill="#e60024"/></g>';
    s += '<path d="M' + (W - 34) + ' 34 L' + (W - 150) + ' 34 L' + (W - 34) + ' 120 Z" fill="url(#p5HalfP)" opacity=".55"/>';
    // seal: chunky ink splash + white mask
    s += '<g transform="rotate(-14 66 54)">' +
         '<g transform="translate(66 54)">' +
         '<path d="' + splashPath(34, 21) + '" fill="' + WHITE + '" transform="scale(1.12)"/>' +
         '<path d="' + splashPath(34, 21) + '" fill="' + INK + '"/></g>' +
         '<path fill-rule="evenodd" d="' + maskPath(44, 46, 0.22) + '" fill="' + WHITE + '"/></g>';
    // ransom headline: per-glyph tilt, alternating white/red tiles
    s += '<g transform="skewX(-8)">' +
         '<text x="118" y="118" font-family="Hiragino Sans GB, PingFang SC, Arial Black, sans-serif"' +
         ' font-size="45" font-weight="900" letter-spacing="6" rotate="-6 4 -3 5"' +
         ' style="paint-order:stroke" stroke="' + INK + '" stroke-width="8">' +
         '<tspan fill="' + WHITE + '">怪</tspan><tspan fill="' + RED_HOT + '" dy="-3">盗</tspan>' +
         '<tspan fill="' + WHITE + '" dy="5">参</tspan><tspan fill="' + WHITE + '" dy="-4">上</tspan></text>' +
         '<rect x="120" y="132" width="188" height="3.4" fill="' + WHITE + '" transform="skewX(-16)"/>' +
         '<rect x="126" y="139" width="150" height="1.8" fill="' + INK + '" opacity=".75" transform="skewX(-16)"/>' +
         '<text x="121" y="163" font-family="Avenir Next Condensed, Arial Narrow, sans-serif"' +
         ' font-size="16" font-weight="700" fill="' + INK + '" letter-spacing="3.4" rotate="0 -2 0 2">PHANTOM MODE — ENGAGED</text>' +
         "</g>";
    // signature bars + star
    s += '<g transform="rotate(-8 292 196)">' +
         '<rect x="252" y="188" width="64" height="7" fill="' + INK + '"/>' +
         '<rect x="252" y="198" width="44" height="4" fill="' + WHITE + '"/></g>';
    s += '<path d="' + star5(318, 176, 9, 3.8, -0.2) + '" fill="' + WHITE + '"/>';
    return '<svg viewBox="0 0 ' + W + " " + H + '" xmlns="' + NS + '" preserveAspectRatio="none">' + DEFS + s + "</svg>";
  }

  /* ---------- state -------------------------------------------------- */

  var reduced = false;
  try { reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}

  function skinActive() {
    return document.documentElement.getAttribute("data-skin") === "persona5";
  }
  function animPaused() {
    return document.documentElement.hasAttribute("data-anim-paused");
  }
  function fxOK() {
    return !reduced && rootEl && rootEl.isConnected && skinActive() && !animPaused();
  }

  var rootEl = null;

  /* ---------- layer construction ------------------------------------- */

  function build() {
    var old = document.getElementById(ID);
    if (old) old.parentNode.removeChild(old);

    var root = document.createElement("div");
    root.id = ID;
    root.setAttribute("aria-hidden", "true");

    var html = "";
    html += '<div class="p5-rings">' + ringsSVG() + "</div>";
    html += '<div class="p5-beam b1"></div><div class="p5-beam b2"></div><div class="p5-beam b3"></div>';
    html += '<div class="p5-bloom"></div><div class="p5-vignette"></div>';
    if (!reduced) html += '<div class="p5-slash"></div>';

    html += '<div class="p5-corner p5-tl">' + cornerSVG() + "</div>";
    html += '<div class="p5-corner p5-tr">' + cornerSVG() + "</div>";
    html += '<div class="p5-corner p5-bl">' + cornerSVG() + "</div>";
    html += '<div class="p5-corner p5-br">' + cornerSVG() + "</div>";

    html += '<div class="p5-emblem">' + emblemSVG(560) + "</div>";
    html += '<div class="p5-phone">' + phoneSVG(170) + "</div>";

    if (!reduced) {
      var layers = ['<div class="p5-depth p5-d1">', '<div class="p5-depth p5-d2">'];
      for (var i = 0; i < 18; i++) {
        var far = i % 2 === 0;
        var dur = 20 + Math.random() * 18;
        var po = far ? 0.06 : 0.1;
        var sz = far ? 8 + Math.random() * 6 : 13 + Math.random() * 9;
        var kind = i % 6, body;
        if (kind === 0) body = starSVG(sz, WHITE, false);
        else if (kind === 1) body = starSVG(sz, RED_HOT, false);
        else if (kind === 2) body = starSVG(sz, WHITE, true);
        else if (kind === 3) body = shardSVG(sz, RED);
        else if (kind === 4) body = maskMiniSVG(sz, WHITE);
        else body = starSVG(sz, RED, true);
        var style =
          "left:" + (6 + Math.random() * 92).toFixed(1) + "vw;" +
          "--dur:" + dur.toFixed(1) + "s;--del:-" + (Math.random() * dur).toFixed(1) + "s;" +
          "--po:" + po.toFixed(3) + ";--sx0:" + (Math.random() * 3 - 1.5).toFixed(1) + "vw;" +
          "--sx1:-" + (3 + Math.random() * 8).toFixed(1) + "vw;" +
          "--rot:" + (Math.random() * 200 - 100).toFixed(0) + "deg;";
        layers[far ? 0 : 1] += '<span class="p5-p" style="' + style + '">' + body + "</span>";
      }
      html += layers[0] + "</div>" + layers[1] + "</div>";
    }

    // faded wordmark to fill the roomier main area
    html += '<div class="p5-ghost">PHANTOM</div>';
    // bottom-right: the date tag (Alt+Shift+U hides it)
    html += '<div class="p5-stack"><div class="p5-date"></div></div>';

    root.innerHTML = html;
    rootEl = root;

    function mount() {
      document.body.appendChild(root);
      dateTick();
      stackPref();
      makeStackDraggable(root.querySelector(".p5-stack"));
      if (!reduced) {
        parallax(root);
        cometLoop();
        maybeCard(false);
      }
    }
    if (document.body) mount();
    else document.addEventListener("DOMContentLoaded", mount);
  }

  /* ---------- date tag ------------------------------------------------ */

  var DOW = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  function dateTick() {
    if (!rootEl) return;
    var el = rootEl.querySelector(".p5-date");
    if (!el) return;
    var d = new Date();
    var mm = ("0" + (d.getMonth() + 1)).slice(-2);
    var dd = ("0" + d.getDate()).slice(-2);
    var hm = ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
    el.innerHTML =
      '<b class="dDay">' + dd + "</b>" +
      '<span class="dCol"><i>' + mm + " / " + DOW[d.getDay()] + "</i><i>" + hm + "</i></span>" +
      '<span class="dStar">' + starSVG(16, WHITE, false) + "</span>";
    setTimeout(dateTick, 20000);
  }

  /* the date tag can be dragged out of the composer's way */
  function makeStackDraggable(stack) {
    if (!stack) return;
    try {
      var p = JSON.parse(localStorage.getItem("mirasim-skin-datepos") || "null");
      if (p) { stack.style.right = p.right + "px"; stack.style.bottom = p.bottom + "px"; }
    } catch (e) {}
    stack.style.pointerEvents = "auto";
    stack.style.cursor = "grab";
    var d = null;
    function move(e) {
      if (!d) return;
      stack.style.right = Math.max(4, Math.min(innerWidth - 60, d.right - (e.clientX - d.x))) + "px";
      stack.style.bottom = Math.max(4, Math.min(innerHeight - 40, d.bottom - (e.clientY - d.y))) + "px";
      e.preventDefault();
    }
    function up() {
      if (d) {
        try {
          localStorage.setItem("mirasim-skin-datepos", JSON.stringify({
            right: parseFloat(stack.style.right) || 18,
            bottom: parseFloat(stack.style.bottom) || 18
          }));
        } catch (e) {}
      }
      d = null; stack.style.cursor = "grab";
      window.removeEventListener("pointermove", move, true);
      window.removeEventListener("pointerup", up, true);
    }
    stack.addEventListener("pointerdown", function (e) {
      var r = stack.getBoundingClientRect();
      d = { x: e.clientX, y: e.clientY, right: innerWidth - r.right, bottom: innerHeight - r.bottom };
      stack.style.cursor = "grabbing";
      window.addEventListener("pointermove", move, true);
      window.addEventListener("pointerup", up, true);
      e.preventDefault();
    });
  }

  /* Alt+Shift+U: hide/show the corner stack (persisted) */
  var UKEY = "mirasim-skin-hud.v1";
  function stackOn() {
    try { return localStorage.getItem(UKEY) !== "off"; } catch (e) { return true; }
  }
  function stackPref() {
    var st = rootEl && rootEl.querySelector(".p5-stack");
    if (st && !stackOn()) st.style.display = "none";
  }
  window.addEventListener("keydown", function (e) {
    if (!e.altKey || !e.shiftKey || e.metaKey || e.ctrlKey) return;
    if ((e.code || "").replace("Key","").toLowerCase() !== "u") return;
    if (!skinActive()) return;
    e.preventDefault();
    var st = rootEl && rootEl.querySelector(".p5-stack");
    if (!st) return;
    var next = stackOn() ? "off" : "on";
    try { localStorage.setItem(UKEY, next); } catch (err) {}
    st.style.display = next === "off" ? "none" : "";
  }, true);

  /* ---------- click burst ----------------------------------------------- */

  var live = 0, MAX_LIVE = 6, seedTick = 0;
  window.addEventListener("pointerdown", function (e) {
    if (!fxOK() || live >= MAX_LIVE) return;
    var el = document.createElement("div");
    el.className = "p5-click";
    el.style.left = e.clientX + "px";
    el.style.top = e.clientY + "px";
    el.innerHTML = clickSVG(101 + (seedTick = (seedTick + 1) % 971) * 7);
    live++;
    el.addEventListener("animationend", function (ev) {
      if (ev.target !== el) return;
      live--;
      if (el.parentNode) el.parentNode.removeChild(el);
    });
    rootEl.appendChild(el);
  }, { capture: true, passive: true });

  /* ---------- the calling card ------------------------------------------- */

  var cardBusy = false;
  function showCard() {
    if (!fxOK() || cardBusy) return;
    cardBusy = true;
    var art = cardSVG();
    var el = document.createElement("div");
    el.className = "p5-card";
    el.innerHTML =
      '<div class="p5-card-h hL">' + art + "</div>" +
      '<div class="p5-card-h hR">' + art + "</div>";
    rootEl.appendChild(el);
    setTimeout(function () { el.classList.add("out"); }, 1500);
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
      cardBusy = false;
    }, 2100);
  }

  function maybeCard(force) {
    var K = "mirasim-skin-p5card.v1";
    try {
      if (!force && sessionStorage.getItem(K)) return;
      sessionStorage.setItem(K, "1");
    } catch (e) {}
    setTimeout(showCard, 650);
  }
  try {
    new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        if (muts[i].attributeName === "data-skin" &&
            muts[i].oldValue !== "persona5" && skinActive()) {
          maybeCard(true);
        }
      }
    }).observe(document.documentElement,
      { attributes: true, attributeOldValue: true, attributeFilter: ["data-skin"] });
  } catch (e) {}

  /* ---------- showtime (Alt+Shift+S) --------------------------------------- */

  var showBusy = false;
  function showtime() {
    if (!fxOK() || showBusy) return;
    showBusy = true;
    var el = document.createElement("div");
    el.className = "p5-show";
    el.innerHTML = '<div class="swPulse"></div><div class="swBeam"></div><div class="swBeam r"></div>';
    rootEl.appendChild(el);
    var w = window.innerWidth, h = window.innerHeight, i;
    for (i = 0; i < 7; i++) {
      (function (i) {
        setTimeout(function () {
          if (!rootEl || !rootEl.isConnected) return;
          var b = document.createElement("div");
          b.className = "p5-click";
          b.style.left = (w * (0.14 + Math.random() * 0.72)).toFixed(0) + "px";
          b.style.top = (h * (0.14 + Math.random() * 0.66)).toFixed(0) + "px";
          b.innerHTML = clickSVG(7000 + i * 137 + Math.floor(Math.random() * 99));
          b.addEventListener("animationend", function (ev) {
            if (ev.target === b && b.parentNode) b.parentNode.removeChild(b);
          });
          el.appendChild(b);
        }, 90 + i * 75);
      })(i);
    }
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
      showBusy = false;
    }, 1500);
  }
  window.addEventListener("keydown", function (e) {
    if (!e.altKey || !e.shiftKey || e.metaKey || e.ctrlKey) return;
    if ((e.code || "").replace("Key","").toLowerCase() !== "s") return;
    if (!skinActive()) return;
    e.preventDefault();
    showtime();
  }, true);

  /* ---------- comet ----------------------------------------------------- */

  function cometLoop() {
    setTimeout(function loop() {
      if (fxOK() && !document.hidden) {
        var c = document.createElement("div");
        c.className = "p5-comet";
        c.style.left = (55 + Math.random() * 40) + "vw";
        c.style.top = (4 + Math.random() * 22) + "vh";
        c.style.setProperty("--cx", -(30 + Math.random() * 26).toFixed(0) + "vw");
        c.style.setProperty("--cy", (10 + Math.random() * 12).toFixed(0) + "vh");
        c.style.setProperty("--cr", (12 + Math.random() * 8).toFixed(0) + "deg");
        c.innerHTML = cometSVG(150);
        c.addEventListener("animationend", function () {
          if (c.parentNode) c.parentNode.removeChild(c);
        });
        rootEl.appendChild(c);
      }
      setTimeout(loop, 60000 + Math.random() * 80000);
    }, 25000 + Math.random() * 30000);
  }

  /* ---------- parallax --------------------------------------------------- */

  function parallax(root) {
    var d1 = root.querySelector(".p5-d1");
    var d2 = root.querySelector(".p5-d2");
    var em = root.querySelector(".p5-emblem");
    var ph = root.querySelector(".p5-phone");
    var tx = 0, ty = 0, x = 0, y = 0, raf = null;
    function tick() {
      x += (tx - x) * 0.06;
      y += (ty - y) * 0.06;
      if (d1) d1.style.transform = "translate3d(" + 6 * x + "px," + 4 * y + "px,0)";
      if (d2) d2.style.transform = "translate3d(" + 13 * x + "px," + 9 * y + "px,0)";
      if (em) em.style.transform =
        "translate(-50%,-50%) translate3d(" + -7 * x + "px," + -5 * y + "px,0)";
      if (ph) ph.style.translate = 5 * x + "px " + 3 * y + "px";
      if (Math.abs(tx - x) + Math.abs(ty - y) > 0.002) raf = requestAnimationFrame(tick);
      else raf = null;
    }
    window.addEventListener("mousemove", function (e) {
      tx = (e.clientX / window.innerWidth) * 2 - 1;
      ty = (e.clientY / window.innerHeight) * 2 - 1;
      if (!raf) raf = requestAnimationFrame(tick);
    }, { passive: true });
  }

  build();

  // exported so preview.html / wallpaper.html reuse the same artwork
  window.__p5Emblem = emblemSVG;
  window.__p5Corner = cornerSVG;
  window.__p5Star = starSVG;
  window.__p5Mask = maskPath;
  window.__p5Phone = phoneSVG;
  window.__p5Card = cardSVG;
  window.__p5CardShow = showCard;
  window.__p5Showtime = showtime;
  window.__p5Click = clickSVG;
  window.__p5Splash = layeredSplash;
  window.__p5Rings = ringsSVG;
})();

/* ==== v5: Mona — sprite pet + phone chat + broadcaster ========
   State machine sit→walk→sleep, jump on click, a Ren-Amamiya-style
   phone chat panel with in-character contextual replies, and an
   auto-broadcaster that listens to Mirasim's OWN websocket
   (same-origin ws://<host>/ws, allowed by CSP) to react when a
   session finishes or quota runs hot. All dialogue is original. */
(function () {
  "use strict";
  var ID = "mirasim-skin-fx";

  var CHATTER = [
    "喵。别老盯着我，去写代码。",
    "头儿，今天也要偷下漂亮的一票啊。",
    "卡壳了？把思路讲给我听，说不定就通了。",
    "我不是猫，我是怪盗团的军师，记住了。",
    "累了就歇会儿，硬撑写不出好东西。",
    "这行逻辑……我闻到 bug 的味道了。",
    "深夜了，Joker。人类是要睡觉的吧？",
    "要不要我帮你盯着那个跑着的会话？"
  ];
  var LINES_DONE = [
    "任务完成——干得漂亮，头儿。",
    "那个会话跑完了，去看看战利品。",
    "搞定一票！下一个目标是谁？"
  ];
  var LINES_QUOTA = [
    "额度快见底了，悠着点用喵。",
    "钱包在报警，头儿——省着点。",
    "再烧下去这个月要吃土了。"
  ];

  function root() { return document.getElementById(ID); }
  function pick(a) { return a[(Math.random() * a.length) | 0]; }

  /* ---------- the pet ------------------------------------------- */
  function Pet() {
    var r = root();
    if (!r || r.querySelector(".p5-mona")) return null;

    var reduced = false;
    try { reduced = matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}

    var pet = document.createElement("div");
    pet.className = "p5-mona";
    pet.title = "点我聊两句 · Alt+Shift+M 收起";
    var wImg = new Image(), sImg = new Image(), jImg = new Image(), zImg = new Image();
    var hImg = new Image(), kImg = new Image();
    wImg.className = "mona-f mona-w"; sImg.className = "mona-f mona-s";
    jImg.className = "mona-f mona-j"; zImg.className = "mona-f mona-z";
    hImg.className = "mona-f mona-h"; kImg.className = "mona-f mona-k";
    var has = { h: false, k: false };
    hImg.onload = function () { has.h = true; };
    kImg.onload = function () { has.k = true; };
    hImg.src = "./mirasim-skin-a-mona-happy.png";
    kImg.src = "./mirasim-skin-a-mona-shock.png";
    wImg.onerror = function () { pet.classList.add("mona-vector"); pet.insertBefore(vecFallback(), pet.firstChild); };
    wImg.src = "./mirasim-skin-a-mona-walk.png";
    sImg.src = "./mirasim-skin-a-mona-sit.png";
    jImg.src = "./mirasim-skin-a-mona-jump.png";
    zImg.src = "./mirasim-skin-a-mona-sleep.png";
    [wImg, sImg, jImg, zImg, hImg, kImg].forEach(function (n) { n.alt = ""; pet.appendChild(n); });

    var say = document.createElement("div");
    say.className = "p5-mona-say";
    pet.appendChild(say);
    r.appendChild(pet);

    function vecFallback() { var d = document.createElement("div"); d.className = "mona-vec"; return d; }

    try { if (localStorage.getItem("mirasim-skin-pet") === "off") pet.style.display = "none"; } catch (e) {}

    var W = function () { return window.innerWidth; };
    // single source of truth for position: x (left px), baseB (bottom px),
    // home (the anchor the walk paces around — set by drag, so she never
    // snaps back to her spawn spot).
    var x = W() * 0.4, baseB = 0, home = x, dir = 1, state = "sit", timer = null, idleAt = Date.now();
    try {
      var sp = JSON.parse(localStorage.getItem("mirasim-skin-pet-pos") || "null");
      if (sp && sp.x != null) { x = home = Math.min(W() - 60, Math.max(12, sp.x)); baseB = Math.max(0, sp.b || 0); }
    } catch (e) {}
    function setState(s) { state = s; pet.className = "p5-mona " + (dir < 0 ? "flip " : "") + "st-" + s + (pet.classList.contains("mona-vector") ? " mona-vector" : ""); }
    function place() { pet.style.left = x + "px"; pet.style.bottom = baseB + "px"; }
    place(); setState("sit");

    function bubble(txt, ms) {
      say.textContent = txt; say.classList.add("on");
      clearTimeout(say._t); say._t = setTimeout(function () { say.classList.remove("on"); }, ms || 2600);
    }

    // ---- drag: pins position, updates home, persists ----
    var down = null, moved = false, pinnedUntil = 0;
    pet.addEventListener("pointerdown", function (e) {
      if (e.button !== 0) return;
      clearTimeout(timer); state = "sit";               // stop any walk step
      down = { px: e.clientX, py: e.clientY, x: x, b: baseB };
      moved = false;
      try { pet.setPointerCapture(e.pointerId); } catch (x) {}
      e.preventDefault();
    });
    pet.addEventListener("pointermove", function (e) {
      if (!down) return;
      var dx = e.clientX - down.px, dy = e.clientY - down.py;
      if (!moved && Math.abs(dx) + Math.abs(dy) < 4) return;
      moved = true; pet.classList.add("mona-grab");
      x = Math.min(W() - 40, Math.max(8, down.x + dx));
      baseB = Math.min(innerHeight - 40, Math.max(0, down.b - dy));
      place();
    });
    function dropPet(e) {
      if (!down) return;
      try { pet.releasePointerCapture(e.pointerId); } catch (x) {}
      if (moved) {
        home = x; pinnedUntil = Date.now() + 12000;      // stay put a while
        pet.classList.remove("mona-grab");
        setState("sit");
        try { localStorage.setItem("mirasim-skin-pet-pos", JSON.stringify({ x: x, b: baseB })); } catch (x) {}
      }
      down = null;
      idleAt = Date.now(); schedule();
    }
    pet.addEventListener("pointerup", dropPet);
    pet.addEventListener("pointercancel", dropPet);

    function walk() {
      if (reduced || pet.style.display === "none" || Date.now() < pinnedUntil) return schedule();
      setState("walk");
      dir = Math.random() < 0.5 ? -1 : 1; setState("walk");
      var dist = 60 + Math.random() * 150;               // roam a short range…
      (function step() {
        if (state !== "walk" || down) return;
        x += dir * 1.15;
        var lo = Math.max(12, home - 130), hi = Math.min(W() - 60, home + 130);  // …around home
        if (x < lo) { x = lo; dir = 1; setState("walk"); }
        if (x > hi) { x = hi; dir = -1; setState("walk"); }
        place(); dist -= 1.15;
        if (dist > 0) timer = setTimeout(step, 16); else rest();
      })();
    }
    function rest() { setState("sit"); idleAt = Date.now(); schedule(); }
    function schedule() { clearTimeout(timer); timer = setTimeout(tick, 1600 + Math.random() * 3600); }
    function tick() {
      if (Date.now() - idleAt > 75000) { setState("sleep"); bubble("Zzz…", 1600); schedule(); return; }
      if (Math.random() < 0.7) walk(); else { bubble(pick(CHATTER), 3200); schedule(); }
    }
    schedule();

    function wake() { if (state === "sleep") { rest(); } idleAt = Date.now(); }
    window.addEventListener("keydown", wake, true);
    window.addEventListener("mousemove", function () { if (state === "sleep") wake(); }, { passive: true });

    var clickN = 0;
    pet.addEventListener("click", function (e) {
      e.stopPropagation();
      if (!reduced) {
        setState((++clickN % 2 === 0 && has.h) ? "happy" : "jump");
        setTimeout(rest, 680);
      }
      Phone.toggle();
    });

    return {
      el: pet,
      say: bubble,
      react: function (kind, t) {
        if (!reduced) {
          var st = kind === "shock" ? (has.k ? "shock" : "jump")
                 : (has.h ? "happy" : "jump");
          setState(st); setTimeout(rest, 900);
        }
        if (t) bubble(t, 4200);
      },
      cheer: function (t) { if (!reduced) { setState((has.h ? "happy" : "jump")); setTimeout(rest, 680); } bubble(t, 3400); },
      toggle: function () {
        var off = pet.style.display === "none";
        pet.style.display = off ? "" : "none";
        try { localStorage.setItem("mirasim-skin-pet", off ? "on" : "off"); } catch (e) {}
      }
    };
  }

  /* ---------- the phone (Ren's chat UI) ------------------------- */
  var Phone = (function () {
    var box = null, log = null, input = null, history = [];

    function build() {
      box = document.createElement("div");
      box.className = "p5-phone-chat";
      box.innerHTML =
        '<div class="pc-head"><span class="pc-mask"></span>' +
        '<div class="pc-id"><b>MORGANA</b><i>怪盗团 · 军师 · 按住我拖动</i></div>' +
        '<button class="pc-c" title="清空对话">🗑</button>' + '<button class="pc-g" title="设置">⚙</button>' +
        '<button class="pc-x" title="关闭">✕</button></div>' +
        '<div class="pc-log"></div>' +
        '<div class="pc-set">' +
        '<label class="ps-row"><span>大模型自由问答<i>可选：需先启动本地 mona-ai 桥</i></span>' +
        '<input type="checkbox" data-k="ai"></label>' +
        '<label class="ps-row"><span>模型<i>仅在桥启动后生效</i></span><select data-k="model">' +
        '<option value="claude-haiku-4-5">Haiku 4.5 · 快省</option>' +
        '<option value="claude-sonnet-4-6">Sonnet 4.6 · 聪明</option>' +
        '<option value="gemini-3.5-flash">Gemini 3.5 Flash</option>' +
        '<option value="gpt-5.6-sol">GPT-5.6 Sol</option></select></label>' +
        '<label class="ps-row"><span>任务播报<i>完成 / 翻车 / 待批准</i></span>' +
        '<input type="checkbox" data-k="notify"></label>' +
        '<label class="ps-row ps-col"><span>人格设定<i>自定义 Mona 的说话方式，留空用默认</i></span>' +
        '<textarea data-k="persona" rows="3" placeholder="例：高冷精英黑客猫，毒舌但靠谱，少说废话…"></textarea></label>' +
        '<div class="ps-status"><b>当前状况</b><div class="ps-stat"></div></div>' +
        '<button class="ps-clear">清空聊天记录</button>' +
        '<p class="ps-note">默认纯本地：时间 / 日期 / 待办 / 战况 / 闲聊即时可用，不联网、不开任何进程。想让她接大模型自由问答，另启动可选的 mona-ai 本地桥（详见 README），再打开上面的开关。</p>' +
        '</div>' +
        '<div class="pc-in"><input type="text" placeholder="对 Mona 说点什么…" />' +
        '<button class="pc-send">▲</button></div>';
      root().appendChild(box);
      log = box.querySelector(".pc-log");
      input = box.querySelector(".pc-in input");
      box.querySelector(".pc-x").onclick = function (e) { e.stopPropagation(); close(); };
      window.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && box.classList.contains("on")) { close(); }
      }, true);
      // drag the phone by its header — window-level listeners so the
      // drag survives leaving the header, transforms, or capture quirks
      (function () {
        var head = box.querySelector(".pc-head"), d = null;
        function move(e) {
          if (!d) return;
          box.style.right = Math.max(4, Math.min(innerWidth - 120, d.right - (e.clientX - d.x))) + "px";
          box.style.bottom = Math.max(4, Math.min(innerHeight - 120, d.bottom - (e.clientY - d.y))) + "px";
          e.preventDefault();
        }
        function up() {
          d = null;
          window.removeEventListener("pointermove", move, true);
          window.removeEventListener("pointerup", up, true);
        }
        head.addEventListener("pointerdown", function (e) {
          if (e.target.closest(".pc-x") || e.target.closest(".pc-g")) return;
          var r = box.getBoundingClientRect();
          d = { x: e.clientX, y: e.clientY, right: innerWidth - r.right, bottom: innerHeight - r.bottom };
          window.addEventListener("pointermove", move, true);
          window.addEventListener("pointerup", up, true);
          e.preventDefault();
          e.stopPropagation();
        });
      })();
      box.querySelector(".pc-send").onclick = send;
      input.addEventListener("keydown", function (e) {
        e.stopPropagation();
        if (e.key === "Enter") send();
      });
      input.addEventListener("click", function (e) { e.stopPropagation(); });
      box.addEventListener("click", function (e) { e.stopPropagation(); });
      // settings drawer
      var drawer = box.querySelector(".pc-set");
      box.querySelector(".pc-g").onclick = function (e) {
        e.stopPropagation(); box.classList.toggle("set-on");
        if (box.classList.contains("set-on")) refreshStat();
      };
      function refreshStat() {
        var el = drawer.querySelector(".ps-stat");
        var sn = (window.__monaSnap && window.__monaSnap()) || {};
        el.innerHTML =
          '<span>会话在跑</span><b>' + (sn.running || 0) + '</b>' +
          '<span>5h 额度</span><b>' + (sn.quota != null ? sn.quota + '%' : '—') + '</b>' +
          '<span>对话</span><b>' + (cfg.ai ? (bridgeUp === false ? '桥未启动' : (bridgeUp ? '大模型' : '检测中…')) : '本地大脑') + '</b>';
        var td = loadTodos();
        el.innerHTML += '<span>待办</span><b>' + td.length + ' 条</b>';
        if (cfg.ai) pingBridge(function () { try { el.querySelectorAll('b')[2].textContent = bridgeUp ? '大模型' : '桥未启动'; } catch (e) {} });
      }
      drawer.querySelectorAll("[data-k]").forEach(function (el) {
        var k = el.dataset.k;
        if (el.type === "checkbox") el.checked = cfg[k] !== false;
        else el.value = cfg[k];
        el.addEventListener("change", function (ev) {
          ev.stopPropagation();
          cfg[k] = el.type === "checkbox" ? el.checked : el.value;
          saveCfg();
        });
        el.addEventListener("click", function (ev) { ev.stopPropagation(); });
      });
      function clearChat() {
        turns = []; saveTurns(); log.innerHTML = "";
        add("mona", "记录清干净了。就当无事发生过喵。");
        box.classList.remove("set-on");
      }
      drawer.querySelector(".ps-clear").onclick = function (e) { e.stopPropagation(); clearChat(); };
      box.querySelector(".pc-c").onclick = function (e) { e.stopPropagation(); clearChat(); };
      // restore past chat
      try { turns = JSON.parse(localStorage.getItem(HKEY) || "[]") || []; } catch (e) { turns = []; }
      if (turns.length) {
        turns.slice(-14).forEach(function (t) { add(t.role === "user" ? "me" : "mona", t.content); });
      } else {
        add("mona", pick(["来了，头儿。什么事？", "喵，找我商量事？说吧。", "怪盗团军师在此，请讲。"]));
      }
    }

    function add(who, txt) {
      var row = document.createElement("div");
      row.className = "pc-row pc-" + who;
      row.innerHTML = '<div class="pc-msg"></div>';
      row.querySelector(".pc-msg").textContent = txt;
      log.appendChild(row); log.scrollTop = log.scrollHeight;
      return row;
    }

    /* in-character contextual reply — reads what Mona can see on the
       page (running sessions, quota, hour). Original dialogue. */
    function reply(q) {
      var s = Broadcast.snapshot(), h = new Date().getHours(), t = q.trim();
      var late = h >= 1 && h < 6;
      if (/晚安|睡觉|困|好累|下班/.test(t)) return pick(["早点睡，头儿。代码明天还在，人垮了可不行。", "去睡吧，剩下的我盯着。晚安喵。"]);
      if (/额度|余额|还够|多少钱|贵|烧钱|token/.test(t)) {
        if (s.quota == null) return "钱包我盯着呢，5 小时窗口一超标立刻喊你。";
        return "5 小时窗口用到 " + s.quota + "% 了，" + (s.quota > 85 ? "见底边缘，收着点喵。" : s.quota > 60 ? "还行，别浪。" : "随便挥霍。");
      }
      if (/在跑|会话|任务|进度|怎么样了/.test(t)) return s.running > 0 ? ("有 " + s.running + " 个会话在忙活，跑完 / 翻车 / 要你拍板我都会第一时间喊你。") : "现在没有会话在跑，安静得我都想眯一觉。";
      if (/bug|报错|错误|不对|崩|修/.test(t)) return "把报错甩给面板里那个 Claude——它动手，我盯场。要我帮你复述给它也行。";
      if (/怎么|如何|为什么|能不能|可以吗/.test(t)) return pick(["这个直接问面板里的 Claude 最快，它比我能写。", "思路我陪你捋，具体实现交给正主。说说你卡在哪？"]);
      if (/你好|hi|hello|在吗|喵|嗨/.test(t)) return pick(["在的，随时待命。", "喵，我一直都在。", late ? "这个点还找我，睡不着？" : "头儿好。"]);
      if (/谁|你是|自我介绍/.test(t)) return "摩尔加纳，怪盗团军师，顺便当你的看板猫兼助手。别叫我猫。";
      if (/无聊|陪我|聊|说话/.test(t)) return late ? "都这个点了还不睡，真拿你没办法。" : pick(CHATTER);
      if (/谢谢|thx|辛苦/.test(t)) return pick(["小事一桩，头儿。", "怪盗团的军师，这点算什么。"]);
      if (t.length < 3) return "嗯？说清楚点喵。";
      return pick(["有意思。正经活儿交给面板里的 Claude，我给你打气盯场。", "记下了，头儿。还有别的？", late ? "夜深了，长话短说喵。" : "喵——继续说。"]);
    }

    var turns = [], aiPort;
    var CFGKEY = "mirasim-skin-mona-cfg", HKEY = "mirasim-skin-mona-chat";
    var cfg = { ai: false, model: "claude-haiku-4-5", notify: true, persona: "" };
    try { Object.assign(cfg, JSON.parse(localStorage.getItem(CFGKEY) || "{}")); } catch (e) {}
    function saveCfg() { try { localStorage.setItem(CFGKEY, JSON.stringify(cfg)); } catch (e) {} }
    function saveTurns() { try { localStorage.setItem(HKEY, JSON.stringify(turns.slice(-40))); } catch (e) {} }
    window.__monaCfg = function () { return cfg; };
    var BRIDGE = "http://127.0.0.1:51789";
    var bridgeUp = null;                         // null unknown, true/false known
    function pingBridge(cb) {
      var ctrl = new AbortController(), t = setTimeout(function () { ctrl.abort(); }, 1500);
      fetch(BRIDGE + "/health", { signal: ctrl.signal })
        .then(function (r) { return r.json(); })
        .then(function (j) { clearTimeout(t); bridgeUp = !!(j && j.ok); cb(bridgeUp); })
        .catch(function () { clearTimeout(t); bridgeUp = false; cb(false); });
    }
    function persona() {
      var s = Broadcast.snapshot();
      return "你是摩尔加纳（Morgana / Mona），《女神异闻录5》里的黑猫怪盗军师，" +
        "现在住在用户的 Mirasim（一个 AI 编程客户端）里当看板猫兼助手。" +
        "称呼用户「头儿」或「Joker」。自信、有点毒舌但真心关照人，爱睡觉也催人睡，" +
        "坚决否认自己是猫，偶尔句尾带「喵」但别每句都带。用中文口语，别用 markdown，" +
        "别太啰嗦。当前状态：正在跑的会话 " + (s.running || 0) + " 个" +
        (s.quota != null ? ("，5 小时额度已用 " + s.quota + "%") : "") + "。" +
        (cfg.persona ? ("\n额外人格要求（优先遵守）：" + cfg.persona) : "");
    }
    function askAI(cb) {
      if (!cfg.ai) return cb(null);
      var ctrl = new AbortController();
      var t = setTimeout(function () { ctrl.abort(); }, 30000);
      fetch(BRIDGE + "/chat", {
        method: "POST", signal: ctrl.signal,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ model: cfg.model || "claude-haiku-4-5", system: persona(), messages: turns.slice(-12) })
      }).then(function (r) { return r.json(); })
        .then(function (d) { clearTimeout(t); bridgeUp = true; cb(d && d.reply ? d.reply.trim() : null); })
        .catch(function () { clearTimeout(t); bridgeUp = false; cb(null); });
    }

    /* instant local commands — work with or without the AI bridge:
       time, date, todo list, quota, session report. Returns a string
       to answer directly, or null to defer to the AI / generic brain. */
    function localCommand(v) {
      var t = v.trim(), now = new Date();
      if (/^(几点|现在几点|报时|什么时间|time)/.test(t))
        return "现在 " + ("0" + now.getHours()).slice(-2) + ":" + ("0" + now.getMinutes()).slice(-2) +
          (now.getHours() >= 1 && now.getHours() < 6 ? " 了，这个点真该睡了喵。" : " 了，头儿。");
      if (/^(几号|今天几号|日期|星期几|date)/.test(t)) {
        var dow = ["日", "一", "二", "三", "四", "五", "六"][now.getDay()];
        return (now.getMonth() + 1) + " 月 " + now.getDate() + " 日，星期" + dow + "。";
      }
      var m = t.match(/^(记一下|记[:：]|todo[:：]?|待办[:：])\s*(.+)/i);
      if (m && m[2]) { var td = loadTodos(); td.push(m[2].trim()); saveTodos(td); return "记下了（第 " + td.length + " 条）：" + m[2].trim(); }
      if (/^(待办|清单|todo|todos|要做什么|有啥要做)$/i.test(t)) {
        var l = loadTodos();
        return l.length ? ("待办 " + l.length + " 条：\n" + l.map(function (x, i) { return (i + 1) + ". " + x; }).join("\n")) : "待办是空的，头儿。清清爽爽。";
      }
      var dm = t.match(/^(删|完成|删除|做完)\s*(\d+)/);
      if (dm) { var a = loadTodos(), idx = parseInt(dm[2], 10) - 1; if (idx >= 0 && idx < a.length) { var done = a.splice(idx, 1)[0]; saveTodos(a); return "划掉了：" + done + "（还剩 " + a.length + " 条）"; } return "没这条喵。"; }
      if (/清空待办/.test(t)) { saveTodos([]); return "待办清空了，头儿。"; }
      if (/^(战况|状况|情况|report|汇报)/.test(t)) {
        var s = Broadcast.snapshot(), p = [];
        p.push(s.running > 0 ? ("有 " + s.running + " 个会话在跑") : "没有会话在跑");
        if (s.quota != null) p.push("5h 额度用到 " + s.quota + "%");
        return p.join("，") + "。跑完 / 翻车 / 要你拍板我都会喊你。";
      }
      return null;
    }
    function loadTodos() { try { return JSON.parse(localStorage.getItem("mirasim-skin-mona-todos") || "[]"); } catch (e) { return []; } }
    function saveTodos(a) { try { localStorage.setItem("mirasim-skin-mona-todos", JSON.stringify(a.slice(0, 50))); } catch (e) {} }

    function send() {
      var v = (input.value || "").trim();
      if (!v) return;
      input.value = "";
      add("me", v);
      turns.push({ role: "user", content: v });

      // 1) instant local commands first (deterministic, offline-proof)
      var lc = localCommand(v);
      if (lc != null) {
        add("mona", lc);
        turns.push({ role: "assistant", content: lc });
        saveTurns(); log.scrollTop = log.scrollHeight;
        return;
      }

      // 2) real AI via the bridge; graceful fallback to the local brain
      var typing = add("mona", "…"), done = false;
      function finish(txt, tag) {
        if (done) return; done = true;
        typing.querySelector(".pc-msg").textContent = txt;
        if (tag) typing.querySelector(".pc-msg").dataset.src = tag;
        turns.push({ role: "assistant", content: txt });
        saveTurns(); log.scrollTop = log.scrollHeight;
      }
      askAI(function (txt) {
        if (txt) finish(txt, "ai");
        else finish(reply(v), "local");
      });
    }

    function open() { if (!box) build(); box.classList.add("on"); setTimeout(function () { input && input.focus(); }, 60); }
    function close() { box && box.classList.remove("on"); }
    function toggle() { if (!box || !box.classList.contains("on")) open(); else close(); }
    function push(txt) { if (box && box.classList.contains("on")) add("mona", txt); }
    return { toggle: toggle, open: open, close: close, push: push };
  })();

  /* ---------- broadcaster: read the app's OWN websocket ---------- */
  var Broadcast = (function () {
    var running = 0, quota = null, seen = {}, sock = null, tries = 0;

    function snapshot() { return { running: running, quota: quota }; }

    function onFrame(m) {
      if (m.type === "sessions" && Array.isArray(m.sessions)) {
        var run = 0;
        m.sessions.forEach(function (s) {
          if (s.runState === "running") run++;
          var now = (s.runState || "") + "|" + (s.phase || "");
          var was = seen[s.sessionKey] || "|";
          var wasRun = was.indexOf("running") === 0;
          var needs = /approv|await|wait|ask|paus|confirm|permission/i;
          if (wasRun && s.runState && s.runState !== "running") {
            if (s.runState === "error") fireR("shock", "「" + (s.title || "有个会话") + "」翻车了，去看看喵。");
            else fireR("happy", pick(LINES_DONE));
          }
          if (needs.test(s.phase || "") && !needs.test(was.split("|")[1] || "")) {
            fireR("shock", "「" + (s.title || "有个会话") + "」在等你拍板，快去点一下。");
          }
          seen[s.sessionKey] = now;
        });
        running = run;
      } else if (m.type === "relay" && m.relay && m.relay.usage) {
        absorbUsage([m.relay.usage]);
      } else if (m.type === "usage" && Array.isArray(m.usage)) {
        absorbUsage(m.usage);
      }
    }
    var warned = false;
    function absorbUsage(list) {
      list.forEach(function (u) {
        if (!u || !u.windows) return;
        u.windows.forEach(function (w) {
          if (w.label === "5h" && w.usedPercent != null) {
            quota = Math.round(w.usedPercent);
            if (quota >= 85 && !warned) { warned = true; fire(pick(LINES_QUOTA)); }
            if (quota < 70) warned = false;
          }
        });
      });
    }
    function fire(txt) { fireR(null, txt); }
    function fireR(kind, txt) {
      try { if (window.__monaCfg && window.__monaCfg().notify === false) return; } catch (e) {}
      if (window.__mona) {
        if (kind && window.__mona.react) window.__mona.react(kind, txt);
        else window.__mona.say(txt, 4200);
      }
      Phone.push(txt);
    }

    function connect() {
      if (tries++ > 8) return;
      try {
        var proto = location.protocol === "https:" ? "wss://" : "ws://";
        sock = new WebSocket(proto + location.host + "/ws");
        sock.onmessage = function (e) { try { onFrame(JSON.parse(e.data)); } catch (x) {} };
        sock.onopen = function () { tries = 0; try { sock.send(JSON.stringify({ type: "getUsage" })); } catch (x) {} };
        sock.onclose = function () { setTimeout(connect, 15000); };
      } catch (e) {}
    }
    // only meaningful inside the app (same-origin ws); harmless elsewhere
    if (location.protocol.indexOf("http") === 0) connect();
    window.__monaSnap = snapshot;
    return { snapshot: snapshot };
  })();

  function boot() {
    var mona = Pet();
    if (mona) window.__mona = mona;
    window.addEventListener("keydown", function (e) {
      if (!e.altKey || !e.shiftKey || e.metaKey || e.ctrlKey) return;
      if (e.code === "KeyM") { e.preventDefault(); mona && mona.toggle(); }
    }, true);
  }
  if (document.body) setTimeout(boot, 80);
  else document.addEventListener("DOMContentLoaded", function () { setTimeout(boot, 80); });
})();

/* ==== v6: Mona — draggable, richer motion, function menu =======
   Attaches to the pet built in v5 (window.__mona). Adds free drag
   with click/drag discrimination + persisted position, extra
   reactions (wiggle, pounce, spook), a P5 radial-ish function menu
   (chat, pomodoro focus timer, fortune, battle report, showtime,
   skin cycle, hide), and a small countdown badge. All original. */
(function () {
  "use strict";
  var ID = "mirasim-skin-fx";

  var FORTUNE = [
    "今日运势 · 大吉：动手写的代码都能一次跑通。",
    "今日运势 · 中吉：小心一个逗号引发的惨案。",
    "今日运势 · 吉：会遇到帮上大忙的报错信息。",
    "今日运势 · 末吉：适合重构，不适合上线。",
    "今日运势 · 凶：别碰生产环境，去睡觉。",
    "今日运势 · 大吉：偷心成功率 100%，出击吧头儿。"
  ];
  var POUNCE = ["嘿！", "抓到你了！", "喵哈！", "别乱点！", "干活干活！"];

  function key(e) {
    var ev = new KeyboardEvent("keydown", {
      code: e, key: e.replace("Key", "").toLowerCase(),
      altKey: true, shiftKey: true, bubbles: true
    });
    window.dispatchEvent(ev);
  }

  function ready(fn) {
    var n = 0;
    (function w() {
      if (window.__mona && window.__mona.el) return fn(window.__mona);
      if (n++ < 60) setTimeout(w, 100);
    })();
  }

  ready(function (mona) {
    var pet = mona.el;
    var reduced = false;
    try { reduced = matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}

    // swallow the click that follows a real drag so the phone doesn't open
    pet.addEventListener("click", function (e) {
      if (moved) { e.stopImmediatePropagation(); e.preventDefault(); moved = false; }
    }, true);

    /* occasional pounce reaction on double-click */
    pet.addEventListener("dblclick", function (e) {
      e.stopImmediatePropagation();
      mona.cheer(POUNCE[(Math.random() * POUNCE.length) | 0]);
    });

    /* ---- the function menu ------------------------------------- */
    var menu = null;
    function buildMenu() {
      menu = document.createElement("div");
      menu.className = "p5-mona-menu";
      var items = [
        ["💬", "找我聊天", function () { pet.click(); }],
        ["⏱", "番茄专注", startPomodoro],
        ["🎴", "今日运势", function () { mona.cheer(FORTUNE[(Math.random() * FORTUNE.length) | 0]); }],
        ["📊", "战况速报", report],
        ["🎭", "SHOWTIME", function () { key("KeyS"); mona.cheer("SHOWTIME！"); }],
        ["🌗", "换个皮肤", function () { key("KeyK"); }],
        ["🙈", "藏起来", function () { mona.toggle(); }]
      ];
      items.forEach(function (it) {
        var b = document.createElement("button");
        b.className = "mm-item";
        b.innerHTML = '<span class="mm-ic">' + it[0] + "</span>" + it[1];
        b.onclick = function (e) { e.stopPropagation(); closeMenu(); it[2](); };
        menu.appendChild(b);
      });
      document.getElementById(ID).appendChild(menu);
    }
    function openMenu() {
      if (!menu) buildMenu();
      var r = pet.getBoundingClientRect();
      var onLeft = r.left > innerWidth / 2;
      menu.style.left = (onLeft ? r.left - 168 : r.right + 8) + "px";
      menu.style.bottom = Math.max(8, innerHeight - r.bottom) + "px";
      menu.classList.add("on");
    }
    function closeMenu() { menu && menu.classList.remove("on"); }
    pet.addEventListener("contextmenu", function (e) {
      e.preventDefault(); e.stopPropagation();
      if (menu && menu.classList.contains("on")) closeMenu(); else openMenu();
    });
    // long-press (trackpad friendly)
    var lpTimer = null;
    pet.addEventListener("pointerdown", function () { lpTimer = setTimeout(openMenu, 550); });
    ["pointerup", "pointermove", "pointercancel"].forEach(function (ev) {
      pet.addEventListener(ev, function () { clearTimeout(lpTimer); });
    });
    window.addEventListener("click", closeMenu, true);

    /* ---- battle report ----------------------------------------- */
    function report() {
      var s = (window.__monaSnap && window.__monaSnap()) || {};
      var parts = [];
      parts.push(s.running > 0 ? ("有 " + s.running + " 个会话在跑") : "没有会话在跑");
      if (s.quota != null) parts.push("额度用到 " + s.quota + "%");
      var h = new Date().getHours();
      if (h >= 1 && h < 6) parts.push("而且已经深夜了，头儿");
      mona.cheer(parts.join("，") + "。");
    }

    /* ---- pomodoro focus timer ---------------------------------- */
    var badge = null, pomo = null;
    function startPomodoro() {
      if (pomo) { clearInterval(pomo); pomo = null; badge && badge.remove(); mona.say("专注取消了。", 2000); return; }
      var end = Date.now() + 25 * 60 * 1000;
      badge = document.createElement("div");
      badge.className = "p5-mona-badge";
      pet.appendChild(badge);
      mona.cheer("25 分钟专注，开始！我帮你盯着，别摸鱼。");
      var tickB = function () {
        var left = Math.max(0, end - Date.now());
        var m = Math.floor(left / 60000), sec = Math.floor((left % 60000) / 1000);
        badge.textContent = m + ":" + (sec < 10 ? "0" : "") + sec;
        if (left <= 0) {
          clearInterval(pomo); pomo = null;
          badge.remove(); badge = null;
          mona.cheer("时间到！这一票偷得漂亮，休息一下喵。");
          key("KeyS"); // celebrate with showtime
        }
      };
      tickB();
      pomo = setInterval(tickB, 1000);
    }

    /* random idle micro-reactions (non-sprite: tiny squash/wiggle) */
    if (!reduced) setInterval(function () {
      if (pet.style.display === "none" || down) return;
      if (Math.random() < 0.25) { pet.classList.add("mona-blink"); setTimeout(function () { pet.classList.remove("mona-blink"); }, 260); }
    }, 5200);
  });
})();

}catch(e){console.warn('persona5 fx',e)}
