import { renderReview } from "./renderReview.js";

export function renderReviewList(reviews, config) {
  if (!reviews || reviews.length === 0) {
    return `
      <div class="no-reviews">
        <p class="no-reviews-title">Aucun avis pour le moment</p>
        <p class="no-reviews-subtitle">Soyez le premier à donner votre avis !</p>
      </div>
    `;
  }

  return `
    <div class="review-list">
      ${reviews.map(review => renderReview(review, config)).join("")}
    </div>
  `;
}
