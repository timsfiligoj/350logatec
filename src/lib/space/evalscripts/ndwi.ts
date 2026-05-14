// Modified Normalised Difference Water Index (MNDWI) for Sentinel-2 L2A.
// MNDWI = (B03 - B11) / (B03 + B11). Xu (2006)'s SWIR-based variant
// suppresses built-up surfaces (metal/plastic roofs, asphalt, concrete)
// that fool the classic NDWI = (B03 - B08): those surfaces have high B11
// while water absorbs B11 almost completely. We keep the view_kind name
// 'ndwi' in the database for stability — internally this is MNDWI.
//
// Caveat: MNDWI shares its band ratio with NDSI, so deep-winter scenes
// where snow covers Planinsko polje can produce a false "water" signal.
// In practice Planinsko polje floods in autumn/early winter before the
// main snow period, so the seasonal story works for this AOI.

export const NDWI_EVALSCRIPT = /* javascript */ `
//VERSION=3
function setup() {
  return {
    input: [{ bands: ["B03", "B11"] }],
    output: { bands: 3, sampleType: "AUTO" },
  };
}

function evaluatePixel(s) {
  const mndwi = (s.B03 - s.B11) / (s.B03 + s.B11);
  // Threshold for water is 0; two stops close together at -0.05 and 0.0
  // give a sharp visual jump so even sub-pixel rivers show as blue.
  return colorBlend(
    mndwi,
    [-1.0, -0.4, -0.05, 0.0, 0.3, 1.0],
    [
      [0.55, 0.45, 0.30],
      [0.75, 0.68, 0.50],
      [0.88, 0.85, 0.75],
      [0.40, 0.70, 0.90],
      [0.20, 0.50, 0.80],
      [0.05, 0.20, 0.55],
    ]
  );
}
`

// Statistical variant: same MNDWI formula but emits a single FLOAT32 band
// so the Statistical API can compute mean / histogram / percentage-above-
// threshold. Output id "ndwi" matches the key in the calculations object
// and the view_kind in the database; the underlying formula is MNDWI.
export const NDWI_STATISTICAL_EVALSCRIPT = /* javascript */ `
//VERSION=3
function setup() {
  return {
    input: [{ bands: ["B03", "B11", "dataMask"] }],
    output: [
      { id: "ndwi", bands: 1, sampleType: "FLOAT32" },
      { id: "dataMask", bands: 1 },
    ],
  };
}

function evaluatePixel(s) {
  const mndwi = (s.B03 - s.B11) / (s.B03 + s.B11);
  return {
    ndwi: [mndwi],
    dataMask: [s.dataMask],
  };
}
`
