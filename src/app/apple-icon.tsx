import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#7F1518',
          border: '6px solid #FFFFFF',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            border: '7px solid #FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'serif',
            fontSize: 100,
            fontWeight: 700,
            color: '#FFFFFF',
            lineHeight: 1,
            paddingBottom: 12,
          }}
        >
          C
        </div>
      </div>
    ),
    { ...size }
  );
}
