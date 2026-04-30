import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 64, height: 64 };
export const contentType = 'image/png';

export default function Icon() {
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
          border: '2px solid #FFFFFF',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            border: '3px solid #FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'serif',
            fontSize: 36,
            fontWeight: 700,
            color: '#FFFFFF',
            lineHeight: 1,
            paddingBottom: 4,
          }}
        >
          C
        </div>
      </div>
    ),
    { ...size }
  );
}
