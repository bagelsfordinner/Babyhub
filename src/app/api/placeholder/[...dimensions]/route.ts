import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { dimensions: string[] } }
) {
  const [width, height] = params.dimensions;
  const widthNum = parseInt(width) || 400;
  const heightNum = parseInt(height) || 400;

  // Create a simple SVG placeholder
  const svg = `
    <svg width="${widthNum}" height="${heightNum}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#EADFC7" stroke-width="1"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="#F7F0E1"/>
      <rect width="100%" height="100%" fill="url(#grid)"/>
      <circle cx="${widthNum/2}" cy="${heightNum/2}" r="30" fill="#9DB87E" opacity="0.6"/>
      <text x="${widthNum/2}" y="${heightNum/2 - 10}" text-anchor="middle" fill="#2A1F1B" font-family="system-ui" font-size="14" font-weight="600">📸</text>
      <text x="${widthNum/2}" y="${heightNum/2 + 15}" text-anchor="middle" fill="#6E615A" font-family="system-ui" font-size="12">${widthNum}×${heightNum}</text>
    </svg>
  `;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}