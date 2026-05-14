// Normalised Difference Water Index for Sentinel-2 L2A — visualisation
// variant. NDWI = (B03 - B08) / (B03 + B08). Values above 0 are typically
// water; the colour ramp goes tan → grey → light blue → deep blue so a
// non-technical viewer immediately reads "land vs. water".

export const NDWI_EVALSCRIPT = /* javascript */ `
//VERSION=3
function setup() {
  return {
    input: [{ bands: ["B03", "B08", "dataMask"] }],
    output: { bands: 4 },
  };
}

function evaluatePixel(s) {
  if (s.dataMask === 0) return [0, 0, 0, 0];
  const ndwi = (s.B03 - s.B08) / (s.B03 + s.B08);
  const rgb = colorBlend(
    ndwi,
    [-1.0, 0.0, 0.3, 1.0],
    [
      [0.66, 0.55, 0.39],
      [0.85, 0.85, 0.85],
      [0.45, 0.65, 0.85],
      [0.05, 0.20, 0.55],
    ]
  );
  return [rgb[0], rgb[1], rgb[2], 1];
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
