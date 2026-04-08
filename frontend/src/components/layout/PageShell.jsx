import Sidebar from "./Sidebar";
import { useAppStore } from "../../store/appStore";
import TimeSeriesPage from "../../pages/TimeSeriesPage";
import ClustersPage from "../../pages/ClustersPage";
import NetworkPage from "../../pages/NetworkPage";
import SearchPage from "../../pages/SearchPage";
import ChatPage from "../../pages/ChatPage";
import AnalysisPage from "../../pages/AnalysisPage";

const PAGE_MAP = {
  timeseries: TimeSeriesPage,
  clusters: ClustersPage,
  network: NetworkPage,
  search: SearchPage,
  chat: ChatPage,
  analysis: AnalysisPage,
};

const PAGE_TITLES = {
  timeseries: { title: "Time Series Analysis", sub: "Post volume and engagement over time" },
  clusters: { title: "Topic Clusters", sub: "BERTopic-derived discussion themes" },
  network: { title: "Network Graph", sub: "Entity relationships and connections" },
  search: { title: "Semantic Search", sub: "Vector-based post retrieval" },
  chat: { title: "AI Assistant", sub: "RAG-powered contextual Q&A" },
  analysis: { title: "Analysis Graphs", sub: "Custom analysis visualizations" },
};

export default function PageShell() {
  const { activePage } = useAppStore();
  const ActivePage = PAGE_MAP[activePage];
  const meta = PAGE_TITLES[activePage];

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <header className="page-header">
          <div>
            <h1 className="page-title">{meta.title}</h1>
            <p className="page-sub">{meta.sub}</p>
          </div>
        </header>
        <div className="page-body">
          <ActivePage />
        </div>
      </main>
    </div>
  );
}