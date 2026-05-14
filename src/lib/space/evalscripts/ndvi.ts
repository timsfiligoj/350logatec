// Normalised Difference Vegetation Index for Sentinel-2 L2A — visualisation
// variant. NDVI = (B08 - B04) / (B08 + B04). Higher values mean denser
// chlorophyll: bare/urban → light vegetation → dense forest.

export const NDVI_EVALSCRIPT = /* javascript */ `
//VERSION=3
function setup() {
  return {
    input: [{ bands: ["B04", "B08", "dataMask"] }],
    output: { bands: 4 },
  };
}

function evaluatePixel(s) {
  if (s.dataMask === 0) return [0, 0, 0, 0];
  const ndvi = (s.B08 - s.B04) / (s.B08 + s.B04);
  const rgb = colorBlend(
    ndvi,
    [-0.2, 0.0, 0.2, 0.5, 0.8],
    [
      [0.20, 0.20, 0.20],
      [0.55, 0.45, 0.35],
      [0.85, 0.80, 0.45],
      [0.45, 0.75, 0.30],
      [0.05, 0.40, 0.08],
    ]
  );
  return [rgb[0], rgb[1], rgb[2], 1];
}
`

export const NDVI_STATISTICAL_EVALSCRIPT = /* javascript */ `
//VERSION=3
function setup() {
  return {
    input: [{ bands: ["B04", "B08", "dataMask"] }],
    output: [
      { id: "ndvi", bands: 1, sampleType: "FLOAT32" },
      { id: "dataMask", bands: 1 },
    ],
  };
}

function evaluatePixel(s) {
  const ndvi = (s.B08 - s.B04) / (s.B08 + s.B04);
  return {
    ndvi: [ndvi],
    dataMask: [s.dataMask],
  };
}
`
