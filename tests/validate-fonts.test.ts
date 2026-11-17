import fs from "fs";
import path from "path";

import { assert, describe, it } from "vitest";

import { Font, Path, Glyph, parse } from "opentype.js";

const fonts = [
  ["Geist", "Regular"],
  ["Geist", "Medium"],
  ["Geist", "SemiBold"],
  ["Geist", "Bold"],
];

describe("validate-fonts", () => {
  it("check if each font generate correct path", () => {
    for (let i = 0; i < fonts.length; i++) {
      let fontDataPath = path.join(
        "assets",
        "fonts",
        fonts[i][0].toLowerCase(),
        `${fonts[i][0]}-${fonts[i][1]}.json`
      );
      let fontRealPath = path.join(
        "assets",
        "fonts",
        fonts[i][0].toLowerCase(),
        `${fonts[i][0]}-${fonts[i][1]}.ttf`
      );

      let fontData = JSON.parse(fs.readFileSync(fontDataPath).toString());
      const buf = fs.readFileSync(fontRealPath);
      let fontReal = parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));

      let font = new Font({
        familyName: fontData.familyName,
        styleName: fontData.styleName,
        unitsPerEm: fontData.unitsPerEm,
        ascender: fontData.ascender,
        descender: fontData.descender,
        glyphs: Object.keys(fontData.glyphs).map((key) => {
          let glyph = fontData.glyphs[key];

          let path = new Path();

          path.commands = glyph.path.commands;
          path.fill = glyph.path.fill;
          path.stroke = glyph.path.stroke;
          path.strokeWidth = glyph.path.strokeWidth;
          (path as any).unitsPerEm = glyph.path.unitsPerEm;

          let result = new Glyph({
            name: key,
            index: glyph.index,
            unicode: glyph.unicode,
            unicodes: glyph.unicodes,
            xMin: glyph.xMin,
            yMin: glyph.yMin,
            xMax: glyph.xMax,
            yMax: glyph.yMax,
            advanceWidth: glyph.advanceWidth,
            path: path,
          });

          (result as any).leftSideBearing = glyph.leftSideBearing;

          return result;
        }),
      });

      (font as any).kerningPairs = {};

      // The generated JSON only keeps the Latin glyphs the banner uses, so it is a subset of the TTF.
      assert.isAbove(font.glyphs.length, 200, `${fonts[i][0]} ${fonts[i][1]} kept too few glyphs`);
      assert.isAtMost(
        font.glyphs.length,
        fontReal.glyphs.length,
        `${fonts[i][0]} ${fonts[i][1]} has more glyphs than its source font`
      );

      let commands = font.getPath("Hello world", 0, 0, 100).commands;
      let commandsReal = fontReal.getPath("Hello world", 0, 0, 100).commands;

      assert.equal(
        commandsReal.length,
        commands.length,
        `${fonts[i][0]} ${fonts[i][1]} has ${commands.length} commands but expected ${commandsReal.length}`
      );
      
      for (let j = 0; j < commandsReal.length; j++) {
        assert.equal(
          JSON.stringify(commands[j].type),
          JSON.stringify(commandsReal[j].type),
          `${fonts[i][0]} ${fonts[i][1]} has ${JSON.stringify(commands[j])} command but expected ${JSON.stringify(commandsReal[j])}`
        );
      }
    }
  });
});
