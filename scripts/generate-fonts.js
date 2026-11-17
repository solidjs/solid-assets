const fs = require('fs')
const opentype = require('opentype.js')

const fonts = [
  ["Geist", "Regular"],
  ["Geist", "Medium"],
  ["Geist", "SemiBold"],
  ["Geist", "Bold"],
];

// Banner text is short Latin labels, so only Basic Latin, Latin-1 and Latin Extended-A are kept.
// This keeps each font JSON (bundled into the worker) small.
function isKept(glyph) {
  const cps = glyph.unicodes && glyph.unicodes.length ? glyph.unicodes : [glyph.unicode]
  return glyph.index === 0 || cps.some((c) => c !== undefined && c >= 0x20 && c <= 0x17f)
}

function generateFont(name, style, file, output) {
  var buf = fs.readFileSync(file)
  var font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength))
  // Construct a Path object containing the letter shapes of the given text.
  // The other parameters are x, y and fontSize.
  // Note that y is the position of the baseline.
  // var path = font.getPath('Hello, World!', 0, 150, 72)

  var glyphs = {}

  for (var i = 0; i < font.glyphs.length; i++) {
    var glyph = font.glyphs.get(i)
    if (!isKept(glyph)) continue

    glyphs[font.glyphNames.glyphIndexToName(i)] = {
      index: i,
      unicode: glyph.unicode,
      unicodes: glyph.unicodes,
      advanceWidth: glyph.advanceWidth,
      path: typeof glyph.path === 'function' ? glyph.path() : glyph.path,
    }
  }

  var fontOptions = {
    familyName: name,
    styleName: style,
    unitsPerEm: font.unitsPerEm,
    ascender: font.ascender,
    descender: font.descender,
    glyphs: glyphs,
  }

  fs.writeFileSync(output, JSON.stringify(fontOptions))

  console.log('Generated font: ' + output)
}

for (var i = 0; i < fonts.length; i++) {
  generateFont(
    fonts[i][0],
    fonts[i][1],
    `assets/fonts/${fonts[i][0].toLowerCase()}/${fonts[i][0]}-${fonts[i][1]}.ttf`,
    `assets/fonts/${fonts[i][0].toLowerCase()}/${fonts[i][0]}-${fonts[i][1]}.json`,
  )
}