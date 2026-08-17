import { useEffect, useRef, useState } from 'react'
import Globe from 'react-globe.gl'
import './index.css'

function App() {
  const globeRef = useRef()
  const restartTimerRef = useRef(null)

  const [selectedPoint, setSelectedPoint] = useState(null)
  const [panelVisible, setPanelVisible] = useState(false)

  useEffect(() => {
    if (!globeRef.current) return

    const controls = globeRef.current.controls()

    controls.autoRotate = true
    controls.autoRotateSpeed = 0.35
    controls.enableZoom = true
    controls.enableRotate = true
    controls.enablePan = false

    const stopRotation = () => {
      controls.autoRotate = false

      if (restartTimerRef.current) {
        clearTimeout(restartTimerRef.current)
      }
    }

    const returnToExploreMode = () => {
      if (restartTimerRef.current) {
        clearTimeout(restartTimerRef.current)
      }

      restartTimerRef.current = setTimeout(() => {
        setPanelVisible(false)
        setSelectedPoint(null)

        controls.autoRotate = true
      }, 8000)
    }

    controls.addEventListener('start', stopRotation)
    controls.addEventListener('end', returnToExploreMode)

    return () => {
      controls.removeEventListener('start', stopRotation)
      controls.removeEventListener('end', returnToExploreMode)

      if (restartTimerRef.current) {
        clearTimeout(restartTimerRef.current)
      }
    }
  }, [])

  const handleGlobeClick = ({ lat, lng }) => {
    if (!globeRef.current) return

    const controls = globeRef.current.controls()

    controls.autoRotate = false

    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current)
    }

    setSelectedPoint({
      lat,
      lng,
    })

    setPanelVisible(true)

    globeRef.current.pointOfView(
      {
        lat,
        lng,
        altitude: 1.35,
      },
      1000
    )

    restartTimerRef.current = setTimeout(() => {
      setPanelVisible(false)
      setSelectedPoint(null)

      controls.autoRotate = true
    }, 8000)
  }

  const markerData = selectedPoint ? [selectedPoint] : []

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
      {/* HEADER */}
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

      {/* ANALYSIS PANEL */}
      <div
        style={{
          position: 'absolute',
          top: '120px',
          right: '35px',
          zIndex: 20,
          width: '310px',
          padding: '22px',
          borderRadius: '16px',
          border: '1px solid rgba(116, 188, 255, 0.28)',
          background: 'rgba(4, 17, 31, 0.88)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 15px 40px rgba(0, 0, 0, 0.35)',

          opacity: panelVisible ? 1 : 0,
          transform: panelVisible
            ? 'translateX(0)'
            : 'translateX(40px)',

          pointerEvents: panelVisible ? 'auto' : 'none',

          transition:
            'opacity 0.45s ease, transform 0.45s ease',
        }}
      >
        <div
          style={{
            fontSize: '11px',
            color: '#7fa6c9',
            letterSpacing: '2px',
            marginBottom: '18px',
          }}
        >
          PUNTO SELEZIONATO
        </div>

        <div
          style={{
            fontSize: '21px',
            fontWeight: '700',
            marginBottom: '8px',
          }}
        >
          ANALISI LOCALITÀ
        </div>

        <div
          style={{
            color: '#7fa6c9',
            fontSize: '14px',
            lineHeight: '1.6',
          }}
        >
          In attesa dei dati della località...
        </div>

        {selectedPoint && (
          <div
            style={{
              marginTop: '22px',
              paddingTop: '16px',
              borderTop:
                '1px solid rgba(116, 188, 255, 0.14)',
              color: '#d7e6f3',
              fontSize: '13px',
            }}
          >
            Punto acquisito correttamente
          </div>
        )}
      </div>

      {/* GLOBE */}
      <Globe
        ref={globeRef}
        width={window.innerWidth}
        height={window.innerHeight}
        backgroundColor="#020811"
        globeImageUrl="https://unpkg.com/three-globe/example/img/earth-night.jpg"
        atmosphereColor="#3a9dff"
        atmosphereAltitude={0.18}

        onGlobeClick={handleGlobeClick}

        pointsData={markerData}
        pointLat="lat"
        pointLng="lng"
        pointColor={() => '#39b7ff'}
        pointAltitude={0.03}
        pointRadius={0.22}
      />
    </div>
  )
}

export default App