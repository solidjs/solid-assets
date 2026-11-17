/* eslint-disable @typescript-eslint/no-explicit-any */
import GeistRegular from "../assets/fonts/geist/Geist-Regular.json";
import GeistBold from "../assets/fonts/geist/Geist-Bold.json";

import { Font, Glyph, Path } from "opentype.js";

const fontRegular = new Font({
  familyName: GeistRegular.familyName,
  styleName: GeistRegular.styleName,
  unitsPerEm: GeistRegular.unitsPerEm,
  ascender: GeistRegular.ascender,
  descender: GeistRegular.descender,
  glyphs: Object.keys(GeistRegular.glyphs).map((key) => {
    const glyph = (GeistRegular.glyphs as any)[key] as any;

    const path = new Path();

    path.commands = glyph.path.commands;

    return new Glyph({
      name: key as any,
      index: glyph.index,
      unicode: glyph.unicode,
      advanceWidth: glyph.advanceWidth,
      path,
    });
  }),
});

fontRegular.kerningPairs = {};

const fontBold = new Font({
  familyName: GeistBold.familyName,
  styleName: GeistBold.styleName,
  unitsPerEm: GeistBold.unitsPerEm,
  ascender: GeistBold.ascender,
  descender: GeistBold.descender,
  glyphs: Object.keys(GeistBold.glyphs).map((key) => {
    const glyph = (GeistBold.glyphs as any)[key] as any;

    const path = new Path();

    path.commands = glyph.path.commands;

    return new Glyph({
      name: key as any,
      index: glyph.index,
      unicode: glyph.unicode,
      advanceWidth: glyph.advanceWidth,
      path,
    });
  }),
});

fontBold.kerningPairs = {};

export const regular = fontRegular;
export const bold = fontBold;
