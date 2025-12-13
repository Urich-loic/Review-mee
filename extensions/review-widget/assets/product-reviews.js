import {
  filterReviews,
  sortReviews,
  paginateReviews,
  escapeHtml,
  formatDate,
} from "./utils.js";
import { renderWidget } from "./renderWidget.js"; // rend tout le widget

document.querySelectorAll('[id^="review-widget-"]').forEach(initWidget);

function initWidget(widget) {
  const config = {
    productId: widget.dataset.productId,
    productHandle: widget.dataset.productHandle,
    layout: widget.dataset.layout || "list",
    showPhotos: widget.dataset.showPhotos === "true",
    showVerified: widget.dataset.showVerified === "true",
    reviewsPerPage: parseInt(widget.dataset.reviewsPerPage) || 10,
    enableSorting: widget.dataset.enableSorting === "true",
    enableFiltering: widget.dataset.enableFiltering === "true",
    starColor: widget.dataset.starColor || "#FFD700",
    buttonBg: widget.dataset.buttonBg || "#000000",
    buttonText: widget.dataset.buttonText || "#FFFFFF",
    shop: widget.dataset.shop,
    locale: widget.dataset.locale || "en",
    appUrl: window.REVIEW_APP_URL || "https://e73c268a38eb.ngrok-free.app",
  };

  let state = {
    currentPage: 1,
    currentSort: "newest",
    currentFilter: "all",
    reviews: [],
    stats: {},
  };

  async function loadReviews() {
    try {
      const response = await fetch(
        `${config.appUrl}/api/storefront/reviews?productId=${config.productId}&shop=${config.shop}`,
      );
      if (!response.ok) throw new Error("Failed to fetch");

      const data = await response.json();
      state.reviews = data.reviews || [];
      state.stats = data.stats || { avgRating: 0, totalReviews: 0 };

      renderWidget(widget, config, state);
      attachEventListeners(widget, config, state);
    } catch (error) {
      console.error("Error loading reviews:", error);
      widget.innerHTML = `
        <div class="review-error">
          <p>Unable to load reviews at this time.</p>
        </div>
      `;
    }
  }

  function attachEventListeners(widget, config, state) {
    // Filtres
    widget.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        state.currentFilter = e.target.dataset.filter;
        state.currentPage = 1;
        renderWidget(widget, config, state);
        attachEventListeners(widget, config, state);
      });
    });

    // Tri
    const sortSelect = widget.querySelector(".sort-select");
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        state.currentSort = e.target.value;
        state.currentPage = 1;
        renderWidget(widget, config, state);
        attachEventListeners(widget, config, state);
      });
    }

    // Pagination
    widget.querySelectorAll(".pagination-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        if (e.target.dataset.page === "next") state.currentPage++;
        if (e.target.dataset.page === "prev") state.currentPage--;
        renderWidget(widget, config, state);
        attachEventListeners(widget, config, state);
        widget.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    // Écrire un avis
    const writeBtn = widget.querySelector('[data-action="write-review"]');
    if (writeBtn) {
      writeBtn.addEventListener("click", () => {
        window.location.href = `/pages/write-review?product=${config.productId}`;
      });
    }

    // Utile
    widget.querySelectorAll(".helpful-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const reviewId = e.currentTarget.dataset.reviewId;
        await markHelpful(reviewId, config, state, widget);
      });
    });
  }

  async function markHelpful(reviewId, config, state, widget) {
    try {
      await fetch(
        `${config.appUrl}/api/storefront/reviews/${reviewId}/helpful`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ shop: config.shop }),
        },
      );
      await loadReviews();
    } catch (error) {
      console.error("Error marking helpful:", error);
    }
  }

  loadReviews();
}
