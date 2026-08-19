function InfoPanel({
  panelVisible,
  locationInfo,
  selectedPoint,
  formatLatitude,
  formatLongitude,
}) {
  return (
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
        boxShadow: '0 15px 40px rgba(0,0,0,.35)',

        opacity: panelVisible ? 1 : 0,
        transform: panelVisible
          ? 'translateX(0)'
          : 'translateX(45px)',

        pointerEvents: panelVisible ? 'auto' : 'none',

        transition:
          'opacity .45s ease, transform .45s ease',
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
              '1px solid rgba(116,188,255,.16)',
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
            }}
          >
            {formatLatitude(selectedPoint.lat)}
          </div>

          <div
            style={{
              color: '#e1edf7',
              fontSize: '16px',
              marginTop: '5px',
            }}
          >
            {formatLongitude(selectedPoint.lng)}
          </div>
        </div>
      )}
    </div>
  )
}

export default InfoPanel