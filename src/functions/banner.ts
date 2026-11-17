import logoDefault from "./assets/banner/logos/default.svg?raw";
import logoTag2 from "./assets/banner/logos/tag-2.0.svg?raw";

import type { Path } from "opentype.js";

import { regular, bold } from "../font";

// Limits for the optional `integration` graphic (a remote SVG merged into
// the banner). These exist so a hostile or oversized response can never
// stall the worker or blow up memory: the URL itself is length-capped, the
// fetch is time-boxed, and the response body is size-capped while streaming
// (Content-Length can't be trusted alone, since a server can lie about it).
const MAX_INTEGRATION_URL_LENGTH = 2048;
const INTEGRATION_FETCH_TIMEOUT_MS = 4000;
const MAX_INTEGRATION_SVG_BYTES = 100 * 1024;

const INTEGRATION_ID_PREFIX = "integration";
const INTEGRATION_TARGET_HEIGHT = 32;
const INTEGRATION_MAX_WIDTH = 140;
const INTEGRATION_MIN_WIDTH = 20;
const INTEGRATION_SIDE_MARGIN = 24;
// The Solid 2.0 lockup (icon + wordmark, light-on-dark variant) is 465.12 x 146.28.
const LOGO_DEFAULT_X = 48.5;
const LOGO_HEIGHT = 44;
const LOGO_WIDTH = (LOGO_HEIGHT * 465.12) / 146.28;
// With `version=2.0` the lockup also carries the yellow "2.0" tag from the launch lockup, which makes it wider
// (591.98 x 146.28).
const LOGO_WIDTH_V2 = (LOGO_HEIGHT * 591.98) / 146.28;
// The wordmark starts 0.363 of the way across the standard lockup; the type caption lines up with it.
const LOGO_WORDMARK_X = LOGO_WIDTH * 0.363;
const LOGO_Y = (100 - LOGO_HEIGHT) / 2;
const LOGO_CAPTION_Y = LOGO_Y - 8;
const CONNECTOR_GAP = 14;
const CONNECTOR_SIZE = 20;
const CONNECTOR_ICON = `<svg viewBox="0 0 20 20"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" fill="#fff"/></svg>`;

// Hue (in degrees) of the banner's brand blue (Solid Blue #0A4593, the project
// tag's fill). An optional `color` param is retinted by rotating every hue in the
// banner by the difference between this and the requested color's own hue.
const DEFAULT_HUE_DEGREES = 214;

// Parses a hex color (`#rgb`, `#rrggbb`, with or without the `#`) into its
// hue in degrees, or null if it isn't a recognizable hex color.
function hexToHueDegrees(hex: string): number | null {
  const match = hex.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!match) {
    return null;
  }

  const value =
    match[1].length === 3
      ? match[1]
          .split("")
          .map((c) => c + c)
          .join("")
      : match[1];

  const r = parseInt(value.slice(0, 2), 16) / 255;
  const g = parseInt(value.slice(2, 4), 16) / 255;
  const b = parseInt(value.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  if (delta === 0) {
    return null; // greyscale colors have no hue to rotate toward
  }

  let hue: number;
  if (max === r) {
    hue = ((g - b) / delta) % 6;
  } else if (max === g) {
    hue = (b - r) / delta + 2;
  } else {
    hue = (r - g) / delta + 4;
  }
  hue *= 60;
  return hue < 0 ? hue + 360 : hue;
}

function isBlockedIntegrationHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (host === "localhost" || host === "0.0.0.0" || host === "::1") {
    return true;
  }
  const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.\d{1,3}\.\d{1,3}$/);
  if (ipv4) {
    const a = Number(ipv4[1]);
    const b = Number(ipv4[2]);
    if (a === 10 || a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
  }
  return false;
}

// Prefix every id defined in the fetched SVG (and every reference to it) so
// it can't shadow our own ids (e.g. "crop", "blur") when spliced into the
// same document, which would silently corrupt the rest of the banner.
function namespaceSvgIds(svg: string): string {
  const ids = new Set<string>();
  const idPattern = /\bid\s*=\s*["']([^"']+)["']/g;
  let match: RegExpExecArray | null;
  while ((match = idPattern.exec(svg))) {
    ids.add(match[1]);
  }

  let namespaced = svg;
  for (const id of ids) {
    const safeId = `${INTEGRATION_ID_PREFIX}-${id}`;
    const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    namespaced = namespaced
      .replace(new RegExp(`(\\bid\\s*=\\s*["'])${escapedId}(["'])`, "g"), `$1${safeId}$2`)
      .replace(new RegExp(`url\\(#${escapedId}\\)`, "g"), `url(#${safeId})`)
      .replace(
        new RegExp(`((?:xlink:href|href)\\s*=\\s*["'])#${escapedId}(["'])`, "g"),
        `$1#${safeId}$2`
      );
  }
  return namespaced;
}

// Strip constructs that could execute script or load further remote
// resources once embedded in our output, then de-collide ids.
function sanitizeIntegrationSvg(svg: string): string | null {
  const sanitized = svg
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/\son\w+\s*=\s*'[^']*'/gi, "")
    .replace(/((?:xlink:href|href)\s*=\s*)"javascript:[^"]*"/gi, '$1""')
    .replace(/((?:xlink:href|href)\s*=\s*)'javascript:[^']*'/gi, "$1''");

  if (!/<svg[\s>]/i.test(sanitized)) {
    return null;
  }

  return namespaceSvgIds(sanitized);
}

function getSvgAspectRatio(svg: string): number {
  const svgTagMatch = svg.match(/<svg\b[^>]*>/i);
  const svgTag = svgTagMatch ? svgTagMatch[0] : "";

  const viewBoxMatch = svgTag.match(/\bviewBox\s*=\s*["']([^"']+)["']/i);
  if (viewBoxMatch) {
    const parts = viewBoxMatch[1].trim().split(/[\s,]+/).map(Number);
    if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
      return parts[2] / parts[3];
    }
  }

  const widthMatch = svgTag.match(/\bwidth\s*=\s*["']([\d.]+)/i);
  const heightMatch = svgTag.match(/\bheight\s*=\s*["']([\d.]+)/i);
  if (widthMatch && heightMatch) {
    const w = Number(widthMatch[1]);
    const h = Number(heightMatch[1]);
    if (w > 0 && h > 0) return w / h;
  }

  return 1;
}

function withDisplayBox(
  svg: string,
  width: number,
  height: number,
  x: number,
  y: number
): string {
  return svg.replace(/<svg([^>]*)>/i, (_full, attrs: string) => {
    const cleanedAttrs = attrs
      .replace(/\s(?:width|height)\s*=\s*"[^"]*"/gi, "")
      .replace(/\s(?:width|height)\s*=\s*'[^']*'/gi, "");
    return `<svg width="${width.toFixed(2)}" height="${height.toFixed(
      2
    )}" x="${x.toFixed(2)}" y="${y.toFixed(2)}"${cleanedAttrs}>`;
  });
}

// Fetches and validates the `integration` SVG. Returns null on any failure
// (bad URL, blocked host, timeout, wrong type, oversized body) so the caller
// can always fall back to rendering the banner without it.
async function fetchIntegrationSvg(rawUrl: string): Promise<string | null> {
  if (rawUrl.length > MAX_INTEGRATION_URL_LENGTH) {
    return null;
  }

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }

  if (url.protocol !== "https:" || isBlockedIntegrationHost(url.hostname)) {
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    INTEGRATION_FETCH_TIMEOUT_MS
  );

  try {
    const response = await fetch(url.toString(), {
      signal: controller.signal,
      redirect: "follow",
    });

    if (!response.ok || !response.body) {
      return null;
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("image/svg+xml")) {
      return null;
    }

    const contentLength = response.headers.get("content-length");
    if (contentLength && Number(contentLength) > MAX_INTEGRATION_SVG_BYTES) {
      return null;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let raw = "";
    let bytesRead = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      bytesRead += value.byteLength;
      if (bytesRead > MAX_INTEGRATION_SVG_BYTES) {
        await reader.cancel();
        return null;
      }

      raw += decoder.decode(value, { stream: true });
    }
    raw += decoder.decode();

    return sanitizeIntegrationSvg(raw);
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

// opentype.js's Path#toSVG can render a literal "NaN" into the path data.
// Its internal rounding does `decimalPart + "e+" + places`; when a
// coordinate's floating-point fractional part is a tiny epsilon (e.g.
// 473.00000000000006), JS stringifies that epsilon in exponential
// notation, producing an invalid number string that Math.round can't
// parse, which corrupts the path and clips whatever glyph comes next.
// Serialize coordinates ourselves with toFixed to sidestep it.
function toSafeSVGPath(path: Path): string {
  let d = "";
  for (const cmd of path.commands) {
    switch (cmd.type) {
      case "M":
        d += `M${cmd.x.toFixed(2)} ${cmd.y.toFixed(2)}`;
        break;
      case "L":
        d += `L${cmd.x.toFixed(2)} ${cmd.y.toFixed(2)}`;
        break;
      case "Q":
        d += `Q${cmd.x1.toFixed(2)} ${cmd.y1.toFixed(2)} ${cmd.x.toFixed(
          2
        )} ${cmd.y.toFixed(2)}`;
        break;
      case "C":
        d += `C${cmd.x1.toFixed(2)} ${cmd.y1.toFixed(2)} ${cmd.x2.toFixed(
          2
        )} ${cmd.y2.toFixed(2)} ${cmd.x.toFixed(2)} ${cmd.y.toFixed(2)}`;
        break;
      case "Z":
        d += "Z";
        break;
    }
  }
  return `<path d="${d}" fill="${path.fill}"/>`;
}

export async function handleRequest(request: Request): Promise<Response> {
  const searchParams = new URLSearchParams(request.url.split("?")[1]);

  const type = searchParams.get("type") || "Community";
  const project = (
    searchParams.get("project") || "example-package"
  ).toUpperCase();

  const isCore = type.toLowerCase() === "core";

  // Opt-in `version=2.0` (or `2`) adds the yellow "2.0" tag to the logo.
  const isV2 = /^2(\.0)?$/.test((searchParams.get("version") || "").trim());
  const logoWidth = isV2 ? LOGO_WIDTH_V2 : LOGO_WIDTH;

  const integrationParam = searchParams.get("integration");
  const integrationSvg = integrationParam
    ? await fetchIntegrationSvg(integrationParam)
    : null;

  const colorParam = searchParams.get("color");
  const targetHue = colorParam ? hexToHueDegrees(colorParam) : null;
  const hueRotateDegrees =
    targetHue !== null ? targetHue - DEFAULT_HUE_DEGREES : null;

  const typeText = regular?.getPath(type, LOGO_DEFAULT_X + LOGO_WORDMARK_X, LOGO_CAPTION_Y + LOGO_HEIGHT + 11, 14, {
    letterSpacing: 0.02,
  });
  typeText.fill = "#fff";

  const projectWidth = bold?.getAdvanceWidth(project, 10, {
    letterSpacing: 0.05,
  });
  const projectText = bold?.getPath(project, 500 - projectWidth - 24, 90, 10, {
    letterSpacing: 0.05,
  });
  projectText.fill = "#fff";

  // Lay out the integration graphic (logo + connector + logo) as a group
  // centered in the banner — its total width depends on the fetched asset's
  // own aspect ratio, so the connector and integration logo's x positions
  // can only be pinned down once that width is known.
  const lockupFixedWidth = logoWidth + CONNECTOR_GAP * 2 + CONNECTOR_SIZE;
  const integrationAvailableWidth =
    500 - INTEGRATION_SIDE_MARGIN * 2 - lockupFixedWidth;
  const renderIntegration =
    integrationSvg !== null &&
    integrationAvailableWidth >= INTEGRATION_MIN_WIDTH;

  let integrationWidth = 0;
  let integrationHeight = 0;
  if (renderIntegration && integrationSvg) {
    integrationHeight = INTEGRATION_TARGET_HEIGHT;
    integrationWidth = integrationHeight * getSvgAspectRatio(integrationSvg);
    const widthCap = Math.min(INTEGRATION_MAX_WIDTH, integrationAvailableWidth);
    if (integrationWidth > widthCap) {
      integrationWidth = widthCap;
      integrationHeight = integrationWidth / getSvgAspectRatio(integrationSvg);
    }
  }

  const logoX = renderIntegration
    ? (500 - (lockupFixedWidth + integrationWidth)) / 2
    : LOGO_DEFAULT_X;
  const connectorX = logoX + logoWidth + CONNECTOR_GAP;
  const integrationStartX = connectorX + CONNECTOR_SIZE + CONNECTOR_GAP;

  let svg = `<svg width="1000" height="200" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 500 100">`;

  // Add masks
  svg += `<mask id="crop">`;
  svg += `<path d="M0,0 h500 v72 q0,28 -28,28 h-472 z" fill="white"/>`;
  svg += `</mask>`;

  svg += `<defs>`;
  if (renderIntegration) {
    // Recolor the integration's logo to solid white (preserving alpha) so
    // it merges with the banner regardless of the source's own colors.
    svg += `<filter id="integration-mono" color-interpolation-filters="sRGB">`;
    svg += `<feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0"/>`;
    svg += `</filter>`;
  }
  if (hueRotateDegrees !== null) {
    // Rotating hue leaves white/grey/black untouched (they have no hue), so
    // this retints the blue background, box, and logo in one pass without
    // touching the white text or the integration logo's white recolor.
    svg += `<filter id="tint" color-interpolation-filters="sRGB">`;
    svg += `<feColorMatrix type="hueRotate" values="${hueRotateDegrees.toFixed(
      2
    )}"/>`;
    svg += `</filter>`;
  }
  // The base background is the website hero's gradient: a 160deg linear gradient from Deep Blue through
  // Solid Blue to a dark navy, with a faint light glow at the top right. The 160deg line is laid out in
  // user space so it keeps its angle on the wide banner.
  svg += `<linearGradient id="hero" gradientUnits="userSpaceOnUse" x1="204.7" y1="-74.5" x2="295.3" y2="174.5">`;
  svg += `<stop offset="0" stop-color="#0265B2"/><stop offset="0.45" stop-color="#0A4593"/><stop offset="1" stop-color="#07305E"/>`;
  svg += `</linearGradient>`;
  svg += `<radialGradient id="glow" gradientUnits="userSpaceOnUse" gradientTransform="translate(425 0) scale(270 90)" cx="0" cy="0" r="1">`;
  svg += `<stop offset="0" stop-color="#fff" stop-opacity="0.14"/><stop offset="0.7" stop-color="#fff" stop-opacity="0"/>`;
  svg += `</radialGradient>`;
  svg += `</defs>`;

  // Apply mask (and the color tint, if requested)
  svg += `<g mask="url(#crop)"${
    hueRotateDegrees !== null ? ' filter="url(#tint)"' : ""
  }>`;

  // Append the background
  svg += `<rect width="500" height="100" fill="url(#hero)"/>`;
  svg += `<rect width="500" height="100" fill="url(#glow)"/>`;

  // Append the logo. An integration graphic replaces the type caption
  // ("Ecosystem"/"Community") with its own connector + logo lockup, so use
  // the logo without a caption in that case too, same as the core variant.
  const showCaption = !(isCore || renderIntegration);
  const logoDrawX = showCaption ? LOGO_DEFAULT_X : logoX;
  const logoDrawY = showCaption ? LOGO_CAPTION_Y : LOGO_Y;
  const logoBox = `width="${logoWidth.toFixed(2)}" height="${LOGO_HEIGHT}" x="${logoDrawX.toFixed(
    2
  )}" y="${logoDrawY.toFixed(2)}"`;
  // The v2 logo reserves room on the right of the wordmark for the tag.
  svg += (isV2
    ? logoDefault.replace('viewBox="0 0 465.12 146.28"', 'viewBox="0 0 591.98 146.28"')
    : logoDefault
  ).replace("<svg", `<svg ${logoBox}`);
  if (showCaption) {
    svg += toSafeSVGPath(typeText);
  }

  if (renderIntegration && integrationSvg) {
    svg += CONNECTOR_ICON.replace(
      "<svg",
      `<svg width="${CONNECTOR_SIZE}" height="${CONNECTOR_SIZE}" x="${connectorX.toFixed(
        2
      )}" y="${(50 - CONNECTOR_SIZE / 2).toFixed(2)}"`
    );

    svg += `<g filter="url(#integration-mono)">`;
    svg += withDisplayBox(
      integrationSvg,
      integrationWidth,
      integrationHeight,
      integrationStartX,
      50 - integrationHeight / 2
    );
    svg += `</g>`;
  }

  // The project name tag competes for the same corner an integration
  // graphic would occupy visually, so hide it whenever one is shown.
  if (!renderIntegration) {
    svg += `<path d="M${500 - projectWidth - 48},72 h${
      projectWidth + 48
    } v28 h-${projectWidth + 48} q0,-28 28,-28 z" fill="#0A4593" />`;
    svg += toSafeSVGPath(projectText);
  }

  svg += `</g>`;

  // The "2.0" tag is drawn outside the tinted group so a `color` retint leaves it yellow.
  if (isV2) {
    svg += logoTag2.replace("<svg", `<svg ${logoBox}`);
  }
  svg += `</svg>`;

  // If an integration was requested but couldn't be fetched, cache the
  // fallback render briefly rather than for a month, so a transient failure
  // on the remote host doesn't get stuck at the edge.
  const maxAge =
    integrationParam && !integrationSvg ? 60 * 5 : 60 * 60 * 24 * 31;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": `public, max-age=${maxAge}`,
    },
  });
}
