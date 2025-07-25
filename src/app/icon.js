import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 32,
  height: 32,
}

export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: 'linear-gradient(135deg, #18bc9c 0%, #16a085 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: '6px',
          border: '1px solid rgba(255,255,255,0.3)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
          }}
        >
          {/* Mapa simplificado */}
          <div
            style={{
              width: '18px',
              height: '18px',
              backgroundColor: 'white',
              borderRadius: '2px',
              border: '0.5px solid #2c3e50',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Marcadores como puntos */}
            <div
              style={{
                position: 'absolute',
                top: '3px',
                left: '4px',
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                backgroundColor: '#e74c3c',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '4px',
                right: '3px',
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                backgroundColor: '#f39c12',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '3px',
                left: '5px',
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                backgroundColor: '#3498db',
              }}
            />
            {/* Punto central */}
            <div
              style={{
                width: '2px',
                height: '2px',
                borderRadius: '50%',
                backgroundColor: '#2c3e50',
              }}
            />
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
