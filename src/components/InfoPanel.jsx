const getWeatherDescription = (code) => {
  const weatherCodes = {
    0: ['☀️', 'Sereno'],
    1: ['🌤️', 'Prevalentemente sereno'],
    2: ['⛅', 'Parzialmente nuvoloso'],
    3: ['☁️', 'Nuvoloso'],
    45: ['🌫️', 'Nebbia'],
    48: ['🌫️', 'Nebbia con brina'],
    51: ['🌦️', 'Pioviggine leggera'],
    53: ['🌦️', 'Pioviggine'],
    55: ['🌧️', 'Pioviggine intensa'],
    61: ['🌧️', 'Pioggia leggera'],
    63: ['🌧️', 'Pioggia'],
    65: ['🌧️', 'Pioggia intensa'],
    71: ['🌨️', 'Neve leggera'],
    73: ['🌨️', 'Neve'],
    75: ['❄️', 'Neve intensa'],
    80: ['🌦️', 'Rovesci leggeri'],
    81: ['🌧️', 'Rovesci'],
    82: ['🌧️', 'Rovesci intensi'],
    95: ['⛈️', 'Temporale'],
    96: ['⛈️', 'Temporale con grandine'],
    99: ['⛈️', 'Temporale forte con grandine'],
  }

  return weatherCodes[code] || ['🌍', 'Condizioni non disponibili']
}

function InfoPanel({
  panelVisible,
  locationInfo,
  selectedPoint,
  formatLatitude,
  formatLongitude,
  timeInfo,
  weatherInfo,
  sunInfo,
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
        border:
          '1px solid rgba(116, 188, 255, 0.28)',
        background:
          'rgba(4, 17, 31, 0.88)',
        backdropFilter: 'blur(12px)',
        boxShadow:
          '0 15px 40px rgba(0, 0, 0, 0.35)',

        opacity: panelVisible ? 1 : 0,

        transform: panelVisible
          ? 'translateX(0)'
          : 'translateX(45px)',

        pointerEvents:
          panelVisible ? 'auto' : 'none',

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
            {locationInfo.city ||
              'AREA SELEZIONATA'}
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
        <>
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
              }}
            >
              {formatLatitude(
                selectedPoint.lat
              )}
            </div>

            <div
              style={{
                color: '#e1edf7',
                fontSize: '16px',
                marginTop: '5px',
              }}
            >
              {formatLongitude(
                selectedPoint.lng
              )}
            </div>
          </div>

          {timeInfo?.localTime && (
            <div
              style={{
                marginTop: '22px',
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
                ORA LOCALE
              </div>

              <div
                style={{
                  color: '#e1edf7',
                  fontSize: '20px',
                  fontWeight: '600',
                }}
              >
                {timeInfo.localTime}
              </div>

              <div
                style={{
                  color: '#7fa6c9',
                  fontSize: '13px',
                  marginTop: '5px',
                }}
              >
                {timeInfo.timezone}
              </div>
            </div>
          )}
          {weatherInfo && (
  <div
    style={{
      marginTop: '22px',
      paddingTop: '16px',
      borderTop: '1px solid rgba(116,188,255,.16)',
    }}
  >
    <div
      style={{
        fontSize: '11px',
        color: '#7fa6c9',
        letterSpacing: '1.5px',
        marginBottom: '10px',
      }}
    >
      METEO ATTUALE
    </div>

    {weatherInfo.loading ? (
      <div
        style={{
          color: '#7fa6c9',
          fontSize: '14px',
        }}
      >
        Caricamento meteo...
      </div>
    ) : (
      <>
      <div
  style={{
    fontSize: '17px',
    fontWeight: '600',
    marginBottom: '12px',
  }}
>
  {getWeatherDescription(weatherInfo.weatherCode)[0]}{' '}
  {getWeatherDescription(weatherInfo.weatherCode)[1]}
</div>

        <div style={{ fontSize: '18px', marginBottom: '7px' }}>
          🌡 {weatherInfo.temperature ?? '--'} °C
        </div>

        <div style={{ fontSize: '15px', marginBottom: '7px' }}>
          💧 Umidità {weatherInfo.humidity ?? '--'}%
        </div>

        <div style={{ fontSize: '15px' }}>
          💨 Vento {weatherInfo.windSpeed ?? '--'} km/h
        </div>
      </>
    )}
  </div>
)}

{sunInfo && (sunInfo.sunrise || sunInfo.sunset) && (
  <div
    style={{
      marginTop: '22px',
      paddingTop: '16px',
      borderTop: '1px solid rgba(116,188,255,.16)',
    }}
  >
    <div
      style={{
        fontSize: '11px',
        color: '#7fa6c9',
        letterSpacing: '1.5px',
        marginBottom: '10px',
      }}
    >
      SOLE
    </div>

    <div style={{ fontSize: '15px', marginBottom: '7px' }}>
      🌅 Alba {sunInfo.sunrise ? sunInfo.sunrise.slice(11, 16) : '--:--'}
    </div>

    <div style={{ fontSize: '15px' }}>
      🌇 Tramonto {sunInfo.sunset ? sunInfo.sunset.slice(11, 16) : '--:--'}
    </div>
  </div>
)}

        </>
      )}
    </div>
  )
}

export default InfoPanel