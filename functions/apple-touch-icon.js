// Serves the SubCheck Apple touch icon as a real PNG (Nov 19, 2026).
// iOS home-screen bookmarks ignore the SVG favicon and fall back to a
// letter tile unless an apple-touch-icon PNG is offered. Same pattern as
// og-image.js: the PNG (180x180, the favicon design full-bleed on brand
// blue) is embedded as base64 because this repo deploys as static files
// plus functions, and the image bytes ride along in code.
const B64 = `
iVBORw0KGgoAAAANSUhEUgAAALQAAAC0CAIAAACyr5FlAAADx0lEQVR4nO3d3ZHbRhCF0ZbLITgFKzErLEfmFKwg/MAqmrXLu+IP
gOkZnPOo1QOW/XGAIbbAb3/+9W/BPb+NPgD6EgeROIjEQSQOInEQiYNIHETiIBIHkTiIxEEkDiJxEImDSBxE4iASB5E4iMRBJA4i
cRCJg0gcROIgEgeROIjEQSQOInEQiYNIHETiIBIHkTiIxEEkDiJxEImDSBxE4iASB5E4iMRBJA4icRCJg0gcROIgEgeROIh+H30A
5/XP3398/sfvP34efyTJN18AeLy7WdxqkojTytF+WcaD/+cA4jjU41Pv0Ic4jvPsvIf3IY6DvDbpsX2I4wjD14DXiGN3b5YxMCxx
EIljX5OeUC7EsaOpyyhx7Gf2MkocO1mgjBLHHrYtY+B9FnFsbI0140IcW9q8jLG3Z8XR1/Ab9+LYzDKXGlfi2MZ6ZZQ/E9zEhmU0
yeLCyvGulbYnH4jjLUueTa7E8bq1yyhxvGz5MkocrzlDGSWO4dqWUeJ4waob18/E8ZzzlFHieMrCH2ncJY5HneQi9JY4HnLCMkoc
jzhnGdXtxlvDR1actozqE8cXM7j8aK6X9a7pfoUWp5W2j6w41cb1s/FxtH1kxcnLqOFxtH1khTJqbBxtH1lxtg+7kvGnlW7OvD35
YFgc78xgv3e2Mm5ZOf6njA9mjaP5ZcECZdS8cdTWfdiefDZxHLXdRJVx19xx1BZzVUYyfRzVdeOzgGFxbPsm6/B52mLLRq2xclyM
/SR+vTJqbBybv6Cj7uEtWUYNXzmG9KGMB40/rezRx2GXmQuXUR3iqH1e4tSHjevjen2N194PXFPGU1qsHFfff/zcb4vrI41n9Yrj
Yo8+XIS+oNdp5VbbN/pJyqieK8dFzxn0PKqd9I2j+k2i2/HsrXUc1WkefY7kMN3jqB5T6XAMx5sgjho9m3OWUZ13K3cdv4U5bRk1
y8pxdeZRHW+yOOrYPk7e4nxx1FEzO3kZNWkctf/klFHzxlF7zk8ZFxPHUftMURlXc8dRW89SGbemj6O2m6gyPlghjjLXfSwSx/vk
9dk6cbwzXWXctU4cbG6pOF5bACwbyVJx1POTVsYXVoujnpm3Mr62YBz12NSV8UuT/bHPsxp+DcNEFo+Dd6x5WmET4iASB5E4iMRB
JA4icRCJg0gcROIgEgeROIjEQSQOInEQiYNIHETiIBIHkTiIxEEkDiJxEImDSBxE4iASB5E4iMRBJA4icRCJg0gcROIgEgeROIjE
QSQOInEQiYNIHETiIBIHkTiIxEEkDiJxEImD6D8x9xB2nOBNCwAAAABJRU5ErkJggg==
`;
export async function onRequest() {
  const bin = atob(B64.replace(/\s/g, ""));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Response(bytes, {
    headers: { "content-type": "image/png", "cache-control": "public, max-age=86400" },
  });
}
