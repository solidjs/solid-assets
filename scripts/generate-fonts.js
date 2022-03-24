const fs = require('fs')
const opentype = require('opentype.js')

const fonts = [
  ["Gordita", "Regular"],
  ["Gordita", "Regular-Italic"],
  ["Gordita", "Bold"],
  ["Gordita", "Bold-Italic"],
  ["Gordita", "Black"],
  ["Gordita", "Black-Italic"],
  ["Gordita", "Light"],
  ["Gordita", "Light-Italic"],
  ["Gordita", "Medium"],
  ["Gordita", "Medium-Italic"],
  ["Gordita", "Thin"],
  ["Gordita", "Thin-Italic"],
  ["Gordita", "Ultra"],
  ["Gordita", "Ultra-Italic"],
];

function generateFont(name, style, file, output) {
  var font = opentype.loadSync(file)
  // Construct a Path object containing the letter shapes of the given text.
  // The other parameters are x, y and fontSize.
  // Note that y is the position of the baseline.
  // var path = font.getPath('Hello, World!', 0, 150, 72)

  var glyphs = {}

  for (var i = 0; i < font.glyphs.length; i++) {
    var glyph = font.glyphs.get(i)

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