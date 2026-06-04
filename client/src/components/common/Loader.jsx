export default function Loader({ fullscreen = false, text = 'Loading...' }) {
  if (fullscreen) {
    return (
      <div className="loader-fullscreen">
        <div className="loader">
          <div className="loader-ring" />
          <div className="loader-ring" />
          <div className="loader-ring" />
        </div>
        <p className="loader-text">{text}</p>
      </div>
    );
  }

  return (
    <div className="loader-container">
      <div className="loader">
        <div className="loader-ring" />
        <div className="loader-ring" />
        <div className="loader-ring" />
      </div>
    </div>
  );
}
