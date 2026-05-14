// Normalised Difference Water Index for Sentinel-2 L2A — visualisation
// variant. NDWI = (B03 - B08) / (B03 + B08). Values above 0 are typically
// water; the colour ramp goes tan → grey → light blue → deep blue so a
// non-technical viewer immediately reads "land vs. water".

export const NDWI_EVALSCRIPT = /* javascript */ `
//VERSION=3
function setup() {
  return {
    input: [{ bands: ["B03", "B08"] }],
    output: { bands: 3, sampleType: "AUTO" },
  };
}

function evaluatePixel(s) {
  const ndwi = (s.B03 - s.B08) / (s.B03 + s.B08);
  // The McFeeters threshold for water is 0. The two stops very close
  // together (-0.05 and 0.0) give a sharp visual jump from land to water
  // at the boundary so even a single sub-pixel river shows up as blue.
  return colorBlend(
    ndwi,
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

// Statistical variant: same NDWI formula but emits a single FLOAT32 band so
// the Statistical API can compute mean / histogram / percentage-above-threshold.
// Output id "ndwi" must match the key in the calculations object.
export const NDWI_STATISTICAL_EVALSCRIPT = /* javascript */ `
//VERSION=3
function setup() {
  return {
    input: [{ bands: ["B03", "B08", "dataMask"] }],
    output: [
      { id: "ndwi", bands: 1, sampleType: "FLOAT32" },
      { id: "dataMask", bands: 1 },
    ],
  };
}

function evaluatePixel(s) {
  const ndwi = (s.B03 - s.B08) / (s.B03 + s.B08);
  return {
    ndwi: [ndwi],
    dataMask: [s.dataMask],
  };
}
`
