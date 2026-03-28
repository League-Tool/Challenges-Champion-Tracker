import ChampionTracker from './ChampionTracker';
import howlingAbyssImg from './assets/howlingAbyssBg.jpg';

const appContainerStyle = {
  minHeight: '100vh',
  width: '100%',
  // We use a linear-gradient to "dim" the image so the UI is readable
  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${howlingAbyssImg})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundAttachment: 'fixed',
  color: '#f0e6d2', // League "Champagne" text color
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  margin: 0,
  padding: 0,
};

function App() {
  return (
    <div className="App" style={appContainerStyle}>
      <ChampionTracker />
    </div>
  );
}

export default App;