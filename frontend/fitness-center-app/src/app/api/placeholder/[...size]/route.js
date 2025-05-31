import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const { size } = params;
  const [width, height] = size.split("/").map(Number);

  // Validate dimensions
  const validWidth = Math.max(1, Math.min(width || 32, 1000));
  const validHeight = Math.max(1, Math.min(height || 32, 1000));

  // Create a simple SVG placeholder
  const svg = `
    <svg width="${validWidth}" height="${validHeight}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <line x1="0" y1="0" x2="${validWidth}" y2="${validHeight}" stroke="#d1d5db" stroke-width="1"/>
      <line x1="${validWidth}" y1="0" x2="0" y2="${validHeight}" stroke="#d1d5db" stroke-width="1"/>
      <text x="50%" y="50%" text-anchor="middle" dy="0.3em" font-family="Arial, sans-serif" font-size="12" fill="#6b7280">
        ${validWidth}×${validHeight}
      </text>
    </svg>
  `.trim();

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
