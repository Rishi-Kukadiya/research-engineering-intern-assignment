import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PageShell from './components/layout/PageShell';


const Dashboard = () => <div className="p-6 bg-white rounded-xl shadow-sm border border-narrative-light"><h2 className="text-2xl font-semibold mb-2">Dashboard</h2><p>Overview metrics will go here.</p></div>;
const TimeSeries = () => <div className="p-6 bg-white rounded-xl shadow-sm border border-narrative-light"><h2 className="text-2xl font-semibold mb-2">Trends</h2><p>Recharts line graphs will go here.</p></div>;
const Network = () => <div className="p-6 bg-white rounded-xl shadow-sm border border-narrative-light"><h2 className="text-2xl font-semibold mb-2">Network Graph</h2><p>Cytoscape canvas will go here.</p></div>;
const Chat = () => <div className="p-6 bg-white rounded-xl shadow-sm border border-narrative-light"><h2 className="text-2xl font-semibold mb-2">AI Analyst</h2><p>The Groq RAG interface will go here.</p></div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PageShell />}>
          <Route index element={<Dashboard />} />
          <Route path="timeseries" element={<TimeSeries />} />
          <Route path="network" element={<Network />} />
          <Route path="chat" element={<Chat />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;