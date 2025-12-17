import { Outlet, useNavigate, useLocation } from "react-router";
import ReviewTabs from "./ReviewTabs";

export default function ReviewsLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = location.pathname;
  const activeTab = currentPath.includes("/widgets")
    ? "widgets"
    : currentPath.includes("/import")
      ? "import"
      : "reviews";

  return (
    <>
      <ReviewTabs />
      {/* Le contenu des routes enfants s'affiche ici */}
      <Outlet />
    </>
  );
}
