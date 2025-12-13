export function renderFilters(state, config) {
  return `
    <div class="review-filters">
      <button class="filter-btn ${state.currentFilter === "all" ? "active" : ""}" data-filter="all">
        Tous (${state.reviews.length})
      </button>
      ${[5, 4, 3, 2, 1]
        .map((rating) => {
          const count = state.reviews.filter((r) => r.rating === rating).length;
          return `
          <button class="filter-btn ${state.currentFilter == rating ? "active" : ""}" data-filter="${rating}">
            ${rating} ★ (${count})
          </button>
        `;
        })
        .join("")}
      ${
        config.showPhotos
          ? `
        <button class="filter-btn ${state.currentFilter === "photos" ? "active" : ""}" data-filter="photos">
          📷 Avec photos (${state.reviews.filter((r) => r.images).length})
        </button>
      `
          : ""
      }
    </div>
  `;
}
