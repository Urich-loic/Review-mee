export function renderPagination(totalReviews, state, config) {
  const totalPages = Math.ceil(totalReviews / config.reviewsPerPage);
  if (totalPages <= 1) return "";

  return `
    <div class="review-pagination">
      <button class="pagination-btn" data-page="prev" ${state.currentPage === 1 ? "disabled" : ""}>← Précédent</button>
      <span class="pagination-info">Page ${state.currentPage} sur ${totalPages}</span>
      <button class="pagination-btn" data-page="next" ${state.currentPage === totalPages ? "disabled" : ""}>Suivant →</button>
    </div>
  `;
}
