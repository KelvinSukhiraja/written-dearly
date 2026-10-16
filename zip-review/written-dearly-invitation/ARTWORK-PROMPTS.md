# Original artwork

Generated with the built-in image-generation tool for this project. No artwork was copied from the Eleganza site. PNG originals are preserved in `public/invitation-art/`; the website uses compressed WebP copies with the bow's alpha channel preserved.

## Botanical linen cover

Output: `public/invitation-art/botanical-linen.webp` and `botanical-linen-original.png`.

Prompt:

> Use case: stylized-concept. Create a production-ready flat artwork texture for a luxury wedding invitation website, portrait 2:3 composition. Full-bleed warm ivory linen paper, tactile delicate hand embroidered botanicals in muted sage green, pale blush flowers, tiny antique champagne gold thread details. A symmetrical but organically imperfect botanical border around the outer edges: graceful climbing stems, little ivory flowers, pale pink clusters, fine leaves. The central 45 percent should be mostly blank ivory linen, ample elegant negative space for typography added in HTML. Straight-on orthographic view, evenly lit with subtle embroidery relief. Entire canvas is the paper itself, no surrounding table, no perspective, no card mockup, no drop shadow, no ribbon, no bow, NO TEXT, no monogram, no watermark, no center seam. This will be used as the same continuous artwork across two animated invitation doors. Understated heirloom stationery, delicate, refined, original design, high quality.

## Silk bow

Output: `public/invitation-art/silk-bow.webp` and `silk-bow-original.png`.

Prompt:

> Use case: product-mockup. Asset type: transparent isolated silk bow for animated luxury wedding invitation. A single beautiful ivory cream silk ribbon tied into a soft symmetrical bow, straight-on orthographic view. Two generous delicate loops spreading left and right, small central knot, two elegant loose tapering tails falling diagonally downwards, lightly frayed delicate fabric edges, fine silk weave and subtle cream highlights. Warm natural soft studio light, understated heirloom stationery. Genuinely TRANSPARENT BACKGROUND with alpha, no paper, no card, no lettering, no surrounding objects, no cast shadow outside the object, no watermark. Entire bow and both tails fully within frame with transparent padding all around. Wide 3:2 composition. The knot exactly centered horizontally; tails end before the image bottom. Premium photorealistic material, ivory not bright white. This is an asset, not a scene.

## Code-native layers

The ribbon band, center seam, cover shading, controls, and typography are CSS/HTML. The same two artwork files supply all moving image layers; CSS clips each cover and bow half independently.
