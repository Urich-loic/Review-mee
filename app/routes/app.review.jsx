import { Outlet } from "react-router";
import { useLocation, useNavigate } from "react-router";

export default function ReviewsLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  // Déterminer l'onglet actif
  const currentPath = location.pathname;
  const activeTab = currentPath.includes("/widgets") ? "widgets" : "reviews";

  return (
    <>
      <style>{`
        .tabs-container {
          background: white;
          border-bottom: 1px solid #e5e7eb;
          margin-bottom: 24px;
        }

        .tabs {
          display: flex;
          gap: 0;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .tab {
          padding: 16px 24px;
          border: none;
          background: transparent;
          color: #6b7280;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          position: relative;
          transition: all 0.2s;
          border-bottom: 3px solid transparent;
        }

        .tab:hover {
          color: #000;
          background: #f9fafb;
        }

        .tab.active {
          color: #000;
          font-weight: 600;
          border-bottom-color: #000;
        }

        .tab-icon {
          margin-right: 8px;
        }

        .tab-badge {
          display: inline-block;
          margin-left: 8px;
          padding: 2px 8px;
          background: #f3f4f6;
          color: #374151;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .tab.active .tab-badge {
          background: #000;
          color: #fff;
        }
      `}</style>

      <s-box>
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
            onClick={() => navigate("/app/reviews/import-review")}
          >
            <span className="tab-icon">🎨</span>
            Importe review
            <span className="tab-badge">3</span>
          </button>
        </div>
      </s-box>

      <Outlet />
    </>
  );
}
