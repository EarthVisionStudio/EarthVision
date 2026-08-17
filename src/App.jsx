import { useEffect, useRef, useState } from 'react'
import Globe from 'react-globe.gl'
import './index.css'

function App() {
  const globeRef = useRef()
  const restartTimerRef = useRef(null)
  const requestRef = useRef(null)
  const requestIdRef = useRef(0)

  const [selectedPoint, setSelectedPoint] = useState(null)
  const [panelVisible, setPanelVisible] = useState(false)

  const [locationInfo, setLocationInfo] = useState({
    city: '',
    country: '',
    loading: false,
  })

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

        setLocationInfo({
          city: '',
          country: '',
          loading: false,
        })

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

      if (requestRef.current) {
        requestRef.current.abort()
      }
    }
  }, [])

  const formatLatitude = (lat) =>
    `${Math.abs(lat).toFixed(3)}° ${lat >= 0 ? 'N' : 'S'}`

  const formatLongitude = (lng) =>
    `${Math.abs(lng).toFixed(3)}° ${lng >= 0 ? 'E' : 'O'}`

  const findLocation = async (lat, lng) => {
    if (requestRef.current) {
      requestRef.current.abort()
    }

    const controller = new AbortController()
    requestRef.current = controller

    const requestId = ++requestIdRef.current

    setLocationInfo({
      city: '',
      country: '',
      loading: true,
    })

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&zoom=10&accept-language=it,en&lat=${lat}&lon=${lng}`,
        {
          signal: controller.signal,
        }
      )

      if (!response.ok) {
        throw new Error('Errore reverse geocoding')
      }

      const data = await response.json()

      // Se nel frattempo hai cliccato altrove,
      // ignoriamo questa risposta vecchia.
      if (requestId !== requestIdRef.current) return

      const address = data.address || {}

      const city =
        address.city ||
        address.town ||
        address.village ||
        address.municipality ||
        address.hamlet ||
        address.county ||
        address.state ||
        data.name ||
        'Area non identificata'

      const country =
        address.country ||
        'Paese non disponibile'

      setLocationInfo({
        city,
        country,
        loading: false,
      })
    } catch (error) {
      if (error.name === 'AbortError') return

      if (requestId !== requestIdRef.current) return

      setLocationInfo({
        city: 'Località non disponibile',
        country: '',
        loading: false,
      })
    }
  }

  const handleGlobeClick = ({ lat, lng }) => {
    if (!globeRef.current) return

    const controls = globeRef.current.controls()

    controls.autoRotate = false

    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current)
    }

    const point = {
      lat: Number(lat),
      lng: Number(lng),
    }

    setSelectedPoint(point)
    setPanelVisible(true)

    findLocation(point.lat, point.lng)

    globeRef.current.pointOfView(
      {
        lat: point.lat,
        lng: point.lng,
        altitude: 1.35,
      },
      1000
    )

    restartTimerRef.current = setTimeout(() => {
      setPanelVisible(false)
      setSelectedPoint(null)

      setLocationInfo({
        city: '',
        country: '',
        loading: false,
      })

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
          width: '330px',
          padding: '22px',
          borderRadius: '16px',
          border: '1px solid rgba(116, 188, 255, 0.28)',
          background: 'rgba(4, 17, 31, 0.88)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 15px 40px rgba(0, 0, 0, 0.35)',
          opacity: panelVisible ? 1 : 0,
          transform: panelVisible
            ? 'translateX(0)'
            : 'translateX(45px)',
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

        {locationInfo.loading ? (
          <div
            style={{
              color: '#7fa6c9',
              fontSize: '15px',
            }}
          >
            Ricerca località...
          </div>
        ) : (
          <>
            <div
              style={{
                fontSize: '22px',
                fontWeight: '700',
                textTransform: 'uppercase',
                marginBottom: '5px',
              }}
            >
              {locationInfo.city || 'AREA SELEZIONATA'}
            </div>

            <div
              style={{
                color: '#82b5df',
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '22px',
              }}
            >
              {locationInfo.country}
            </div>
          </>
        )}

        {selectedPoint && (
          <div
            style={{
              paddingTop: '16px',
              borderTop:
                '1px solid rgba(116, 188, 255, 0.16)',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                color: '#7fa6c9',
                letterSpacing: '1.5px',
                marginBottom: '9px',
              }}
            >
              COORDINATE
            </div>

            <div
              style={{
                color: '#e1edf7',
                fontSize: '16px',
                letterSpacing: '1px',
              }}
            >
              {formatLatitude(selectedPoint.lat)}
            </div>

            <div
              style={{
                color: '#e1edf7',
                fontSize: '16px',
                letterSpacing: '1px',
                marginTop: '5px',
              }}
            >
              {formatLongitude(selectedPoint.lng)}
            </div>
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