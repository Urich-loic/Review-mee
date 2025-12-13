import {
  filterReviews,
  sortReviews,
  paginateReviews,
  formatDate,
  escapeHtml,
} from "./utils.js";
import { renderSummary } from "./utils/renderSummary.js";
import { renderFilters } from "./utils/renderFilters.js";
import { renderSort } from "./utils/renderSort.js";
import { renderReviewList } from "./utils/renderReviewList.js";
import { renderPagination } from "./utils/renderPagination.js";
import { renderWriteButton } from "./utils/renderWriteButton.js";
import { renderStars } from "./utils/renderStars.js";


export function renderWidget(widget, config, state) {
  const filtered = filterReviews(state.reviews, state.currentFilter);
  const sorted = sortReviews(filtered, state.currentSort);
  const paginated = paginateReviews(
    sorted,
    state.currentPage,
    config.reviewsPerPage,
  );

  widget.innerHTML = `
    <div class="review-widget review-layout-${config.layout}">
      ${renderSummary(state)}
      ${config.enableFiltering ? renderFilters(state) : ""}
      ${config.enableSorting ? renderSort(state) : ""}
      ${renderReviewList(paginated, config)}
      ${renderPagination(sorted.length, state, config)}
      ${renderWriteButton()}
    </div>
  `;
}

// ... implémenter toutes les fonctions renderSummary, renderFilters, renderSort, renderReviewList, renderReview, renderPagination, renderWriteButton, renderStars
