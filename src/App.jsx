import { useEffect, useRef, useState } from 'react'
import Globe from 'react-globe.gl'
import './index.css'

import Header from './components/Header'
import InfoPanel from './components/InfoPanel'

function App() {
  const globeRef = useRef()
  const restartTimerRef = useRef(null)

  const locationRequestRef = useRef(null)
  const locationRequestIdRef = useRef(0)

  const timeRequestRef = useRef(null)
  const timeRequestIdRef = useRef(0)

  const [selectedPoint, setSelectedPoint] = useState(null)
  const [panelVisible, setPanelVisible] = useState(false)

  const [locationInfo, setLocationInfo] = useState({
    city: '',
    country: '',
    loading: false,
  })

  const [timeInfo, setTimeInfo] = useState({
  localTime: '',
  timezone: '',
  timezoneId: '',
})

useEffect(() => {
  if (!timeInfo.timezoneId) return

  const updateLocalTime = () => {
    const localTime = new Date().toLocaleTimeString('it-IT', {
      timeZone: timeInfo.timezoneId,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })

    setTimeInfo((current) => ({
      ...current,
      localTime,
    }))
  }

  updateLocalTime()

  const timer = setInterval(updateLocalTime, 1000)

  return () => clearInterval(timer)
}, [timeInfo.timezoneId])

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

        setTimeInfo({
          localTime: '',
          timezone: '',
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

      if (locationRequestRef.current) {
        locationRequestRef.current.abort()
      }

      if (timeRequestRef.current) {
        timeRequestRef.current.abort()
      }
    }
  }, [])

  const formatLatitude = (lat) =>
    `${Math.abs(lat).toFixed(3)}° ${lat >= 0 ? 'N' : 'S'}`

  const formatLongitude = (lng) =>
    `${Math.abs(lng).toFixed(3)}° ${lng >= 0 ? 'E' : 'O'}`

  const findLocation = async (lat, lng) => {
  if (locationRequestRef.current) {
    locationRequestRef.current.abort()
  }

  const controller = new AbortController()
  locationRequestRef.current = controller

  const requestId = ++locationRequestIdRef.current

  setLocationInfo({
    city: '',
    country: '',
    loading: true,
  })

  const fetchLocation = async (zoom) => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&zoom=${zoom}&accept-language=it,en&lat=${lat}&lon=${lng}`,
      {
        signal: controller.signal,
      }
    )

    if (!response.ok) {
      throw new Error('Errore reverse geocoding')
    }

    return response.json()
  }

  try {
    let data = await fetchLocation(10)

    if (requestId !== locationRequestIdRef.current) return

    let address = data.address || {}

    if (data.error || !address.country) {
      data = await fetchLocation(8)

      if (requestId !== locationRequestIdRef.current) return

      address = data.address || {}
    }

    const city =
      address.city ||
      address.town ||
      address.village ||
      address.municipality ||
      address.hamlet ||
      address.county ||
      address.state_district ||
      address.state ||
      data.name ||
      'Area non identificata'

    const country =
      address.country ||
      'Paese non disponibile'

    if (requestId !== locationRequestIdRef.current) return

    setLocationInfo({
      city,
      country,
      loading: false,
    })
  } catch (error) {
    if (error.name === 'AbortError') return

    if (requestId !== locationRequestIdRef.current) return

    setLocationInfo({
      city: 'Area non identificata',
      country: 'Paese non disponibile',
      loading: false,
    })
  }
}

  const findLocalTime = async (lat, lng) => {
    if (timeRequestRef.current) {
      timeRequestRef.current.abort()
    }

    const controller = new AbortController()
    timeRequestRef.current = controller

    const requestId = ++timeRequestIdRef.current

    setTimeInfo({
      localTime: '',
      timezone: '',
    })

    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m&timezone=auto`,
        {
          signal: controller.signal,
        }
      )

      if (!response.ok) {
        throw new Error('Errore nel recupero del fuso orario')
      }

      const data = await response.json()

      if (requestId !== timeRequestIdRef.current) return

      const timezone = data.timezone || ''
      const timezoneAbbreviation =
        data.timezone_abbreviation || ''

      if (!timezone) {
        throw new Error('Fuso orario non disponibile')
      }

      const localTime = new Date().toLocaleTimeString(
        'it-IT',
        {
          timeZone: timezone,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }
      )

      setTimeInfo({
  localTime,
  timezone:
    timezoneAbbreviation || timezone,
  timezoneId: timezone,
})
    } catch (error) {
      if (error.name === 'AbortError') return

      if (requestId !== timeRequestIdRef.current) return

      setTimeInfo({
        localTime: '',
        timezone: '',
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
    findLocalTime(point.lat, point.lng)

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

      setTimeInfo({
        localTime: '',
        timezone: '',
      })

      controls.autoRotate = true
    }, 8000)
  }

  const markerData = selectedPoint
    ? [selectedPoint]
    : []

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
      <Header />

      <InfoPanel
        panelVisible={panelVisible}
        locationInfo={locationInfo}
        selectedPoint={selectedPoint}
        formatLatitude={formatLatitude}
        formatLongitude={formatLongitude}
        timeInfo={timeInfo}
      />

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