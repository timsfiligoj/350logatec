// Sentinel-2 L2A true color evalscript for the Sentinel Hub Process API.
// Bands B04 (red), B03 (green), B02 (blue) are stretched with a small gain so
// land surfaces over Logatec do not look washed out. Output is 8-bit RGB.

export const TRUE_COLOR_EVALSCRIPT = /* javascript */ `
//VERSION=3
function setup() {
  return {
    input: [{ bands: ["B02", "B03", "B04"], units: "REFLECTANCE" }],
    output: { bands: 3, sampleType: "AUTO" },
  };
}

function evaluatePixel(sample) {
  const gain = 2.5;
  return [sample.B04 * gain, sample.B03 * gain, sample.B02 * gain];
}
`
