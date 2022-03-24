/* eslint-disable @typescript-eslint/no-explicit-any */
import GorditaRegular from "../assets/fonts/Gordita/Gordita-Regular.json";
import GorditaBold from "../assets/fonts/Gordita/Gordita-Bold.json";

import { Font, Glyph, Path } from "opentype.js";

const fontRegular = new Font({
  familyName: GorditaRegular.familyName,
  styleName: GorditaRegular.styleName,
  unitsPerEm: GorditaRegular.unitsPerEm,
  ascender: GorditaRegular.ascender,
  descender: GorditaRegular.descender,
  glyphs: Object.keys(GorditaRegular.glyphs).map((key) => {
    const glyph = (GorditaRegular.glyphs as any)[key] as any;

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
  familyName: GorditaBold.familyName,
  styleName: GorditaBold.styleName,
  unitsPerEm: GorditaBold.unitsPerEm,
  ascender: GorditaBold.ascender,
  descender: GorditaBold.descender,
  glyphs: Object.keys(GorditaBold.glyphs).map((key) => {
    const glyph = (GorditaBold.glyphs as any)[key] as any;

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
