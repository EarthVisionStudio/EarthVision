import { useEffect, useRef } from 'react'
import Globe from 'react-globe.gl'

function GlobeView({
  selectedPoint,
  onGlobeClick,
  onInteractionStart,
  onInteractionEnd,
}) {
  const globeRef = useRef()

  useEffect(() => {
    if (!globeRef.current) return

    const controls = globeRef.current.controls()

    controls.autoRotate = true
    controls.autoRotateSpeed = 0.35
    controls.enableZoom = true
    controls.enableRotate = true
    controls.enablePan = false

    const handleStart = () => {
      onInteractionStart?.(globeRef.current)
    }

    const handleEnd = () => {
      onInteractionEnd?.(globeRef.current)
    }

    controls.addEventListener('start', handleStart)
    controls.addEventListener('end', handleEnd)

    return () => {
      controls.removeEventListener('start', handleStart)
      controls.removeEventListener('end', handleEnd)
    }
  }, [onInteractionStart, onInteractionEnd])

  const markerData = selectedPoint ? [selectedPoint] : []

  const handleClick = ({ lat, lng }) => {
    if (!globeRef.current) return

    onGlobeClick?.(
      {
        lat: Number(lat),
        lng: Number(lng),
      },
      globeRef.current
    )
  }

  return (
    <Globe
      ref={globeRef}
      width={window.innerWidth}
      height={window.innerHeight}
      backgroundColor="#020811"
      globeImageUrl="https://unpkg.com/three-globe/example/img/earth-night.jpg"
      atmosphereColor="#3a9dff"
      atmosphereAltitude={0.18}
      onGlobeClick={handleClick}
      pointsData={markerData}
      pointLat="lat"
      pointLng="lng"
      pointColor={() => '#39b7ff'}
      pointAltitude={0.03}
      pointRadius={0.22}
    />
  )
}

export default GlobeView