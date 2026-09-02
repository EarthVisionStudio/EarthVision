import { useEffect, useRef, useState } from 'react'
import Globe from 'react-globe.gl'
import * as THREE from 'three'
import * as solar from 'solar-calculator'
import './index.css'

import Header from './components/Header'
import InfoPanel from './components/InfoPanel'

const DAY_TEXTURE =
  'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-day.jpg'

const NIGHT_TEXTURE =
  'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg'

  const dayNightShader = {
  vertexShader: `
    varying vec3 vNormal;
    varying vec2 vUv;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vUv = uv;

      gl_Position =
        projectionMatrix *
        modelViewMatrix *
        vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    #define PI 3.141592653589793

    uniform sampler2D dayTexture;
    uniform sampler2D nightTexture;
    uniform vec2 sunPosition;
    uniform vec2 globeRotation;

    varying vec3 vNormal;
    varying vec2 vUv;

    float toRad(float value) {
      return value * PI / 180.0;
    }

    vec3 polarToCartesian(vec2 coordinates) {
      float theta = toRad(90.0 - coordinates.x);
      float phi = toRad(90.0 - coordinates.y);

      return vec3(
        sin(phi) * cos(theta),
        cos(phi),
        sin(phi) * sin(theta)
      );
    }

    void main() {
      float invLon = toRad(globeRotation.x);
      float invLat = -toRad(globeRotation.y);

      mat3 rotX = mat3(
        1, 0, 0,
        0, cos(invLat), -sin(invLat),
        0, sin(invLat), cos(invLat)
      );

      mat3 rotY = mat3(
        cos(invLon), 0, sin(invLon),
        0, 1, 0,
        -sin(invLon), 0, cos(invLon)
      );

      vec3 sunDirection =
        rotX *
        rotY *
        polarToCartesian(sunPosition);

      float intensity =
        dot(normalize(vNormal), normalize(sunDirection));

      vec4 dayColor =
        texture2D(dayTexture, vUv);

      vec4 nightColor =
        texture2D(nightTexture, vUv);

      float blendFactor =
        smoothstep(-0.1, 0.1, intensity);

      gl_FragColor =
        mix(nightColor, dayColor, blendFactor);
    }
  `,
}

const sunPosAt = (date) => {
  const day = new Date(+date).setUTCHours(0, 0, 0, 0)
  const t = solar.century(date)

  const longitude =
    ((day - date) / 864e5) * 360 - 180

  return [
    longitude - solar.equationOfTime(t) / 4,
    solar.declination(t),
  ]
}

function App() {
  const globeRef = useRef()
  const restartTimerRef = useRef(null)

  const [globeMaterial, setGlobeMaterial] = useState(null)

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

const [weatherInfo, setWeatherInfo] = useState({
  temperature: null,
  humidity: null,
  windSpeed: null,
  weatherCode: null,
  loading: false,
})

const [sunInfo, setSunInfo] = useState({
  sunrise: '',
  sunset: '',
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

    const scene = globeRef.current.scene()
    const textureLoader = new THREE.TextureLoader()

const dayTexture = textureLoader.load(DAY_TEXTURE)
const nightTexture = textureLoader.load(NIGHT_TEXTURE)

const material = new THREE.ShaderMaterial({
  uniforms: {
    dayTexture: { value: dayTexture },
    nightTexture: { value: nightTexture },
    sunPosition: {
      value: new THREE.Vector2(...sunPosAt(new Date())),
    },
    globeRotation: {
      value: new THREE.Vector2(0, 0),
    },
  },
  vertexShader: dayNightShader.vertexShader,
  fragmentShader: dayNightShader.fragmentShader,
})

setGlobeMaterial(material)

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)

const sunLight = new THREE.DirectionalLight(0xffffff, 2.2)
sunLight.position.set(-5, 2, 5)
scene.add(sunLight)

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

  const findWeather = async (lat, lng) => {
  setWeatherInfo({
    temperature: null,
    humidity: null,
    windSpeed: null,
    weatherCode: null,
    loading: true,
  })

  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`
    )

    if (!response.ok) {
      throw new Error('Errore meteo')
    }

    const data = await response.json()

    setWeatherInfo({
      temperature: data.current?.temperature_2m ?? null,
      humidity: data.current?.relative_humidity_2m ?? null,
      windSpeed: data.current?.wind_speed_10m ?? null,
      weatherCode: data.current?.weather_code ?? null,
      loading: false,
    })
  } catch (error) {
    setWeatherInfo({
      temperature: null,
      humidity: null,
      windSpeed: null,
      weatherCode: null,
      loading: false,
    })
  }
}

const findSunTimes = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=sunrise,sunset&timezone=auto`
    )

    if (!response.ok) {
      throw new Error('Errore alba/tramonto')
    }

    const data = await response.json()

    const sunrise = data.daily?.sunrise?.[0] ?? ''
    const sunset = data.daily?.sunset?.[0] ?? ''

    setSunInfo({
      sunrise,
      sunset,
    })
  } catch (error) {
    setSunInfo({
      sunrise: '',
      sunset: '',
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
    findWeather(point.lat, point.lng)
    findSunTimes(point.lat, point.lng)

    globeRef.current.pointOfView(
      {
        lat: point.lat,
        lng: point.lng,
        altitude: 0.75,
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

      globeRef.current.pointOfView(
  {
    lat: 0,
    lng: 0,
    altitude: 2.5,
  },
  1000
)

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
        weatherInfo={weatherInfo}
        sunInfo={sunInfo}
      />

<div className="stars-background" />

      <Globe
        ref={globeRef}
        width={window.innerWidth}
        height={window.innerHeight}
        backgroundColor="rgba(0,0,0,0)"
        globeMaterial={globeMaterial || undefined}
        atmosphereColor="#3a9dff"
        atmosphereAltitude={0.16}
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