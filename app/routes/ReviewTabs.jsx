import { Outlet, useNavigate, useLocation } from "react-router";

export default function ReviewTabs() {
  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = location.pathname;
  const activeTab = currentPath.includes("/widgets")
    ? "widgets"
    : currentPath.includes("/import")
      ? "import"
      : "reviews";
      
  return (
    <div className="tabs-container">
      <div className="tabs">
        <button
          className={`tab ${activeTab === "reviews" ? "active" : ""}`}
          onClick={() => navigate("/app/reviews")}
        >
          <span className="tab-icon">⭐</span>
          Avis
        </button>

        <button
          className={`tab ${activeTab === "widgets" ? "active" : ""}`}
          onClick={() => navigate("/app/reviews/widgets")}
        >
          <span className="tab-icon">🎨</span>
          Widgets
          <span className="tab-badge">3</span>
        </button>

        <button
          className={`tab ${activeTab === "import" ? "active" : ""}`}
          onClick={() => navigate("/app/reviews/import")}
        >
          <span className="tab-icon">📥</span>
          Importer
        </button>
      </div>
    </div>
  );
}
