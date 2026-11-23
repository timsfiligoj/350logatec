// Sentinel-1 radar water detection for the Planinsko polje flood view.
//
// Water is a mirror for C-band radar: the pulse bounces away from the
// satellite, so open water returns almost nothing. We call a pixel water
// when terrain-corrected gamma0 VV backscatter is below -16.5 dB. The
// threshold was verified over Planinsko polje (2025-11 and 2026-11 floods
// vs. dry summer passes, see memory 350space-sentinel1-radar). The Process
// request also applies a 5x5 Lee speckle filter; without it single pixels
// in the forest flicker blue.
//
// Both scripts must use the same criterion, so the km² number matches the
// blue on the image.

export const S1_WATER_DB_THRESHOLD = -16.5

const IS_WATER = `
function isWater(s1) {
  if (!s1 || s1.dataMask !== 1) return false;
  var db = 10 * Math.log(Math.max(s1.VV, 1e-6)) / Math.LN10;
  return db < ${S1_WATER_DB_THRESHOLD};
}`

// Data fusion: datasource "s1" (the pass) + datasource "s2" (a fixed clear
// optical base scene). Base is lightened 45 % towards white so the blue
// water reads as the subject; water pixels are 85 % blue over the base.
// Output is 3-band UINT8 (no alpha, see CDSE quirk #5).
export const S1_WATER_COMPOSITE_EVALSCRIPT = `//VERSION=3
function setup() {
  return {
    input: [
      { datasource: 's1', bands: ['VV', 'dataMask'] },
      { datasource: 's2', bands: ['B02', 'B03', 'B04'] }
    ],
    output: { bands: 3, sampleType: 'UINT8' },
    mosaicking: 'SIMPLE'
  };
}
${IS_WATER}
function lighten(v) { return 255 * (0.45 + 0.55 * Math.min(1, 2.5 * v)); }
function evaluatePixel(samples) {
  var s1 = samples.s1[0];
  var s2 = samples.s2[0];
  var r = lighten(s2.B04), g = lighten(s2.B03), b = lighten(s2.B02);
  if (isWater(s1)) {
    r = 0.15 * r + 0.85 * 30;
    g = 0.15 * g + 0.85 * 110;
    b = 0.15 * b + 0.85 * 230;
  }
  return [r, g, b];
}`

// Per-pixel class for counting: 0 = no radar data, 1 = dry, 2 = water.
export const S1_WATER_MASK_EVALSCRIPT = `//VERSION=3
function setup() {
  return {
    input: ['VV', 'dataMask'],
    output: { bands: 1, sampleType: 'UINT8' }
  };
}
${IS_WATER}
function evaluatePixel(s) {
  if (s.dataMask !== 1) return [0];
  return [isWater(s) ? 2 : 1];
}`
