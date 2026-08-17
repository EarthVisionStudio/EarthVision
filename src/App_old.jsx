import { useEffect, useRef, useState } from 'react'
import Globe from 'globe.gl'

function App() {
  const globeRef = useRef(null)

  const [time, setTime] = useState(new Date())

  // Punto realmente selezionato dall'utente.
  // All'avvio è NULL: nessuna coordinata finta.
  const [selectedPoint, setSelectedPoint] = useState(null)

  // Città e Paese sono separati dalle coordinate.
  const [locationInfo, setLocationInfo] = useState({
    city: '',
    country: '',
    loading: false,
  })

  // =========================
  // OROLOGIO UTC
  // =========================
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // =========================
  // GLOBO
  // =========================
  useEffect(() => {
    const container = globeRef.current

container.innerHTML = ''

const globe = Globe()(container)
      .globeImageUrl(
        'https://unpkg.com/three-globe/example/img/earth-night.jpg'
      )
      .backgroundColor('#020811')
      .atmosphereColor('#3a9dff')
      .atmosphereAltitude(0.18)

    const controls = globe.controls()

    // Rotazione automatica
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.4

    // Controlli manuali
    controls.enableZoom = true
    controls.enableRotate = true
    controls.enablePan = false

    // QUESTA È SOLO LA POSIZIONE INIZIALE DELLA CAMERA.
    // NON viene mostrata come punto selezionato.
    globe.pointOfView(
      {
        lat: 12,
        lng: -20,
        altitude: 1.85,
      },
      0
    )

    let restartTimer = null

    // Ferma la rotazione
    const stopRotation = () => {
      controls.autoRotate = false

      if (restartTimer) {
        clearTimeout(restartTimer)
      }
    }

    // Riparte dopo 8 secondi di inattività
    const scheduleRestart = () => {
      if (restartTimer) {
        clearTimeout(restartTimer)
      }

      restartTimer = setTimeout(() => {
        controls.autoRotate = true
      }, 8000)
    }

    // Mouse / trackpad / touch
    controls.addEventListener('start', stopRotation)
    controls.addEventListener('end', scheduleRestart)

    // =========================
    // CLICK SULLA TERRA
    // =========================
    globe.onGlobeClick(({ lat, lng }) => {
      const selectedLat = Number(lat)
      const selectedLng = Number(lng)

      console.log(
        'PUNTO CLICCATO:',
        selectedLat,
        selectedLng
      )

      stopRotation()

      // QUESTE SONO LE COORDINATE REALI
      // CHE MOSTREREMO NELLA SCHEDA.
      setSelectedPoint({
        lat: selectedLat,
        lng: selectedLng,
      })

      // Mostriamo subito che stiamo cercando la località
      setLocationInfo({
        city: 'Ricerca località...',
        country: '',
        loading: true,
      })

      // Zoom e centratura sul punto cliccato
      globe.pointOfView(
        {
          lat: selectedLat,
          lng: selectedLng,
          altitude: 1.15,
        },
        1200
      )

      // =========================
      // CITTÀ + PAESE
      // =========================
      fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&accept-language=it&lat=${selectedLat}&lon=${selectedLng}`
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error('Errore geocoding')
          }

          return response.json()
        })
        .then((data) => {
          const address = data.address || {}

          const city =
            address.city ||
            address.town ||
            address.village ||
            address.municipality ||
            address.hamlet ||
            address.county ||
            address.state ||
            'Località non disponibile'

          setLocationInfo({
            city,
            country:
              address.country || '',
            loading: false,
          })
        })
        .catch((error) => {
          console.error(
            'Errore località:',
            error
          )

          setLocationInfo({
            city: 'Località non disponibile',
            country: '',
            loading: false,
          })
        })

      scheduleRestart()
    })

    return () => {
  controls.removeEventListener(
    'start',
    stopRotation
  )

  controls.removeEventListener(
    'end',
    scheduleRestart
  )

  if (restartTimer) {
    clearTimeout(restartTimer)
  }

  container.innerHTML = ''
    }
  }, [])

  // =========================
  // OROLOGIO
  // =========================
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

  // =========================
  // FORMATTAZIONE COORDINATE
  // =========================
  const formatLatitude = (lat) => {
    const direction = lat >= 0 ? 'N' : 'S'

    return `${Math.abs(lat).toFixed(3)}° ${direction}`
  }

  const formatLongitude = (lng) => {
    const direction = lng >= 0 ? 'E' : 'O'

    return `${Math.abs(lng).toFixed(3)}° ${direction}`
  }

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
      {/* =====================
          BRAND
      ====================== */}
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

      {/* =====================
          OROLOGIO UTC
      ====================== */}
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

      {/* =====================
          STATUS
      ====================== */}
      <div
        style={{
          position: 'absolute',
          left: '40px',
          bottom: '35px',
          zIndex: 10,
          padding: '14px 18px',
          border:
            '1px solid rgba(127, 166, 201, 0.25)',
          borderRadius: '12px',
          background:
            'rgba(2, 8, 17, 0.55)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div
          style={{
            fontSize: '11px',
            color: '#7fa6c9',
            letterSpacing: '2px',
            marginBottom: '7px',
          }}
        >
          SYSTEM STATUS
        </div>

        <div
          style={{
            fontSize: '14px',
            letterSpacing: '1px',
          }}
        >
          ● LIVE
        </div>
      </div>

      {/* =====================
          GLOBO
      ====================== */}
      <div ref={globeRef} />

      {/* =====================
          PUNTO SELEZIONATO
      ====================== */}
      <div
        style={{
          position: 'absolute',
          bottom: '30px',
          right: '40px',
          zIndex: 10,
          minWidth: '330px',
          padding: '18px 20px',
          background:
            'rgba(5, 18, 32, 0.88)',
          border:
            '1px solid rgba(116, 188, 255, 0.25)',
          borderRadius: '14px',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div
          style={{
            fontSize: '11px',
            color: '#7fa6c9',
            letterSpacing: '2px',
            marginBottom: '9px',
          }}
        >
          PUNTO SELEZIONATO
        </div>

        {!selectedPoint ? (
          <div
            style={{
              color: '#7fa6c9',
              fontSize: '15px',
            }}
          >
            Clicca su un punto della Terra
          </div>
        ) : (
          <>
            <div
              style={{
                fontSize: '20px',
                fontWeight: '700',
                textTransform: 'uppercase',
                marginBottom: '4px',
              }}
            >
              {locationInfo.city}
            </div>

            <div
              style={{
                fontSize: '14px',
                color: '#8db6dc',
                textTransform: 'uppercase',
                marginBottom: '14px',
              }}
            >
              {locationInfo.country}
            </div>

            <div
              style={{
                fontSize: '16px',
                color: '#d8e6f2',
                letterSpacing: '1px',
              }}
            >
              {formatLatitude(selectedPoint.lat)}
              {' · '}
              {formatLongitude(selectedPoint.lng)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default App