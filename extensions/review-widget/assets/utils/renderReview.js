import { renderStars } from "./renderStars.js";
import { escapeHtml, formatDate } from "./utils.js";

export function renderReview(review, config) {
  const images = review.images ? JSON.parse(review.images) : [];
  const date = new Date(review.createdAt);

  return `
    <div class="review-card">
      <div class="review-header">
        <div class="review-author">
          <div class="author-avatar">${review.customerName.charAt(0).toUpperCase()}</div>
          <div class="author-info">
            <span class="author-name">${escapeHtml(review.customerName)}</span>
            ${config.showVerified && review.verified ? `<span class="verified-badge">✓ Achat vérifié</span>` : ""}
          </div>
        </div>
        <span class="review-date">${formatDate(date, config.locale)}</span>
      </div>

      <div class="review-rating">${renderStars(review.rating)}</div>

      ${review.title ? `<h4 class="review-title">${escapeHtml(review.title)}</h4>` : ""}
      <p class="review-content">${escapeHtml(review.content)}</p>

      ${
        config.showPhotos && images.length > 0
          ? `
        <div class="review-images">
          ${images.map((img, i) => `<img src="${img}" alt="Photo ${i + 1}" class="review-image" loading="lazy">`).join("")}
        </div>
      `
          : ""
      }

      <div class="review-footer">
        <button class="helpful-btn" data-review-id="${review.id}">👍 Utile (${review.helpful || 0})</button>
      </div>
    </div>
  `;
}
