// Normalised Difference Snow Index for Sentinel-2 L2A — visualisation
// variant. NDSI = (B03 - B11) / (B03 + B11). The standard NASA snow-mask
// threshold is 0.4; the colour ramp jumps from neutral to light blue and
// then to white above that threshold so snow is visually unambiguous.
//
// B11 is a 20 m native band; the Process API automatically resamples to
// match the request width/height, so no special handling is needed here.

export const NDSI_EVALSCRIPT = /* javascript */ `
//VERSION=3
function setup() {
  return {
    input: [{ bands: ["B03", "B11"] }],
    output: { bands: 3, sampleType: "AUTO" },
  };
}

function evaluatePixel(s) {
  const ndsi = (s.B03 - s.B11) / (s.B03 + s.B11);
  return colorBlend(
    ndsi,
    [-1.0, 0.0, 0.4, 0.7, 1.0],
    [
      [0.18, 0.18, 0.18],
      [0.55, 0.55, 0.55],
      [0.50, 0.75, 0.95],
      [0.85, 0.95, 1.00],
      [1.00, 1.00, 1.00],
    ]
  );
}
`

export const NDSI_STATISTICAL_EVALSCRIPT = /* javascript */ `
//VERSION=3
function setup() {
  return {
    input: [{ bands: ["B03", "B11", "dataMask"] }],
    output: [
      { id: "ndsi", bands: 1, sampleType: "FLOAT32" },
      { id: "dataMask", bands: 1 },
    ],
  };
}

function evaluatePixel(s) {
  const ndsi = (s.B03 - s.B11) / (s.B03 + s.B11);
  return {
    ndsi: [ndsi],
    dataMask: [s.dataMask],
  };
}
`
