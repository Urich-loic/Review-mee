import { loadReviews, markHelpful } from "./api.js";
import { renderWidget } from "./render.js";

export function attachEventListeners(widget, config, state, reloadFn) {
  // Filtres
  widget.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      state.currentFilter = e.target.dataset.filter;
      state.currentPage = 1;
      renderWidget(widget, config, state);
    });
  });

  // Tri
  const sortSelect = widget.querySelector(".sort-select");
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      state.currentSort = e.target.value;
      state.currentPage = 1;
      renderWidget(widget, config, state);
    });
  }

  // Pagination
  widget.querySelectorAll(".pagination-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      if (e.target.dataset.page === "next") state.currentPage++;
      if (e.target.dataset.page === "prev") state.currentPage--;
      renderWidget(widget, config, state);
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
      await markHelpful(reviewId, config, state, widget, renderWidget);
    });
  });
}
