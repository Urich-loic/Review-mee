import { renderStars } from "./renderStars.js";

export function renderSummary(state) {
  const { avgRating, totalReviews } = state.stats || { avgRating: 0, totalReviews: 0 };
  return `
    <div class="review-summary">
      <div class="review-summary-content">
        <div class="review-rating-box">
          <span class="rating-number">${avgRating.toFixed(1)}</span>
          <div class="stars-large">${renderStars(avgRating)}</div>
          <span class="review-count">${totalReviews} ${totalReviews === 1 ? "avis" : "avis"}</span>
        </div>
        ${renderHistogram(state)}
      </div>
    </div>
  `;
}

function renderHistogram(state) {
  if (!state.stats.distribution) return "";

  return `
    <div class="rating-histogram">
      ${[5,4,3,2,1].map(rating => {
        const count = state.stats.distribution[rating] || 0;
        const percentage = state.stats.totalReviews > 0
          ? ((count / state.stats.totalReviews) * 100).toFixed(0)
          : 0;
        return `
          <div class="histogram-row" data-rating="${rating}">
            <span class="histogram-label">${rating} ★</span>
            <div class="histogram-bar-bg">
              <div class="histogram-bar" style="width: ${percentage}%"></div>
            </div>
            <span class="histogram-count">${count}</span>
          </div>
        `;
      }).join("")}
    </div>
  `;
}
