function Header() {
  return (
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
          color: 'white',
          fontFamily: 'Arial, sans-serif',
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
          fontFamily: 'Arial, sans-serif',
        }}
      >
        LIVE EARTH INTELLIGENCE
      </div>
    </div>
  )
}

export default Header