// Normalised Difference Snow Index for Sentinel-2 L2A.
// NDSI = (B03 - B11) / (B03 + B11). The NASA standard 0.4 threshold gives
// snow pixels, but the bare index also flags water (Planinsko polje when
// flooded has the same band signature as snow). We use Sen2Cor's SCL band
// to gate the snow colour: only SCL == 11 (SNOW) gets the bright
// snow-blue/white ramp; everything else (including SCL == 6 = WATER) falls
// back to a grey ramp.

export const NDSI_EVALSCRIPT = /* javascript */ `
//VERSION=3
function setup() {
  return {
    input: [{ bands: ["B03", "B11", "SCL"] }],
    output: { bands: 3, sampleType: "AUTO" },
  };
}

function evaluatePixel(s) {
  const ndsi = (s.B03 - s.B11) / (s.B03 + s.B11);
  if (s.SCL === 11) {
    return colorBlend(
      ndsi,
      [0.0, 0.4, 0.7, 1.0],
      [
        [0.50, 0.75, 0.95],
        [0.70, 0.85, 0.98],
        [0.85, 0.95, 1.00],
        [1.00, 1.00, 1.00],
      ]
    );
  }
  return colorBlend(
    ndsi,
    [-1.0, 0.0, 0.4],
    [
      [0.18, 0.18, 0.18],
      [0.50, 0.50, 0.50],
      [0.65, 0.65, 0.65],
    ]
  );
}
`

// Statistical variant: emit 1 for pixels SCL == 11 (snow), 0 otherwise.
// Mean of the result is the snow fraction over the AOI — directly the
// metric we want, without conflating water as "snow".
export const NDSI_STATISTICAL_EVALSCRIPT = /* javascript */ `
//VERSION=3
function setup() {
  return {
    input: [{ bands: ["SCL", "dataMask"] }],
    output: [
      { id: "ndsi", bands: 1, sampleType: "FLOAT32" },
      { id: "dataMask", bands: 1 },
    ],
  };
}

function evaluatePixel(s) {
  return {
    ndsi: [s.SCL === 11 ? 1 : 0],
    dataMask: [s.dataMask],
  };
}
`
