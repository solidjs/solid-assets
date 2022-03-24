import backgroundBlocks from "./assets/banner/backgrounds/blocks.svg?raw";
import backgroundTiles from "./assets/banner/backgrounds/tiles.svg?raw";
import logoContext from "./assets/banner/logos/context.svg?raw";
import logoDefault from "./assets/banner/logos/default.svg?raw";

import { regular, bold } from "../font";

export async function handleRequest(request: Request): Promise<Response> {
  const searchParams = new URLSearchParams(request.url.split("?")[1]);

  const type = searchParams.get("type") || "Community";
  const background = searchParams.get("background") || "blocks";
  const project = (
    searchParams.get("project") || "example-package"
  ).toUpperCase();

  const isCore = type.toLowerCase() === "core";

  console.log(isCore, type, background, project);

  const typeText = regular?.getPath(type, 105, 67, 14, {
    letterSpacing: 0.05,
  });
  typeText.fill = "#fff";

  const projectWidth = bold?.getAdvanceWidth(project, 14, {
    letterSpacing: 0.05,
  });
  const projectText = bold?.getPath(project, 500 - projectWidth - 24, 90, 14, {
    letterSpacing: 0.05,
  });
  projectText.fill = "#fff";

  let svg = `<svg width="1000" height="200" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 500 100">`;

  // Add masks
  svg += `<mask id="crop">`;
  svg += `<path d="M0,0 h500 v72 q0,28 -28,28 h-472 z" fill="white"/>`;
  svg += `</mask>`;

  svg += `<defs>`;
  // Add blur effect to box
  svg += `<filter y="-5" height="52" id="blur" color-interpolation-filters="sRGB">`;
  svg += `<feDropShadow dx="0" dy="2" stdDeviation="12" flood-color="#148CC0" flood-opacity="0.5"/>`;
  svg += `</filter>`;
  svg += `</defs>`;

  // Apply mask
  svg += `<g mask="url(#crop)" >`;

  // Append the background
  switch (background.toLowerCase()) {
    case "tiles":
      svg += backgroundTiles;
      break;
    default:
      svg += backgroundBlocks;
  }

  // Append the logo
  if (isCore) {
    svg += logoDefault.replaceAll(
      "<svg",
      `<svg width="182.53" height="41.12" x="48.5" y="29.44"`
    );
  } else {
    svg += logoContext.replaceAll(
      "<svg",
      `<svg width="182.53" height="41.12" x="48.5" y="29.44"`
    );
    svg += typeText.toSVG(2);
  }

  svg += `<path d="M${500 - projectWidth - 48},72 h${projectWidth + 48} v28 h-${
    projectWidth + 48
  } q0,-28 28,-28 z" fill="#0E478C" filter="url(#blur)" />`;
  svg += projectText.toSVG(2);

  svg += `</g>`;
  svg += `</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
    },
  });
}
