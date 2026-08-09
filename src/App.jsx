import { useEffect, useRef, useState } from 'react'
import Globe from 'globe.gl'

function App() {
  const globeRef = useRef(null)
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const globe = Globe()(globeRef.current)
      .globeImageUrl(
        'https://unpkg.com/three-globe/example/img/earth-night.jpg'
      )
      .backgroundColor('#020811')
      .atmosphereColor('#3a9dff')
      .atmosphereAltitude(0.18)

    globe.controls().autoRotate = true
    globe.controls().autoRotateSpeed = 0.4
    globe.controls().enableZoom = false

    globe.pointOfView(
      {
        lat: 12,
        lng: -20,
        altitude: 1.85,
      },
      1200
    )
  }, [])

  const utcTime = time.toLocaleTimeString('it-IT', {
    timeZone: 'UTC',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  const utcDate = time.toLocaleDateString('it-IT', {
    timeZone: 'UTC',
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: '#020811',
        overflow: 'hidden',
        position: 'relative',
        fontFamily: 'Arial, sans-serif',
        color: 'white',
      }}
    >
      {/* BRAND */}
      <div
        style={{
          position: 'absolute',
          top: '30px',
          left: '40px',
          zIndex: 10,
        }}
      >
        <div
          style={{
            fontSize: '28px',
            fontWeight: '700',
            letterSpacing: '3px',
          }}
        >
          EARTH VISION
        </div>

        <div
          style={{
            marginTop: '6px',
            color: '#7fa6c9',
            fontSize: '14px',
            letterSpacing: '2px',
          }}
        >
          LIVE EARTH INTELLIGENCE
        </div>
      </div>

      {/* UTC CLOCK */}
      <div
        style={{
          position: 'absolute',
          top: '28px',
          right: '40px',
          zIndex: 10,
          textAlign: 'right',
        }}
      >
        <div
          style={{
            fontSize: '30px',
            fontWeight: '300',
            letterSpacing: '2px',
          }}
        >
          {utcTime}
          <span
            style={{
              fontSize: '13px',
              color: '#7fa6c9',
              marginLeft: '10px',
            }}
          >
            UTC
          </span>
        </div>

        <div
          style={{
            color: '#7fa6c9',
            fontSize: '12px',
            marginTop: '5px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          {utcDate}
        </div>
      </div>

      {/* GLOBE */}
      <div ref={globeRef} />
    </div>
  )
}

export default App