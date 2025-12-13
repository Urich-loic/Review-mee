// utils.js

/**
 * Filtre les avis selon le filtre choisi par l'utilisateur
 * @param {Array} reviews - Liste des avis
 * @param {string} currentFilter - Filtre actuel ("all", "photos", "1"-"5")
 * @returns {Array} - Avis filtrés
 */
export function filterReviews(reviews, currentFilter) {
  if (currentFilter === "all") return reviews;
  if (currentFilter === "photos")
    return reviews.filter((r) => r.images && r.images.length > 0);
  return reviews.filter((r) => r.rating === parseInt(currentFilter));
}

/**
 * Trie les avis selon le critère choisi par l'utilisateur
 * @param {Array} reviews - Liste des avis
 * @param {string} currentSort - Critère de tri ("newest", "oldest", "highest", "lowest", "helpful")
 * @returns {Array} - Avis triés
 */
export function sortReviews(reviews, currentSort) {
  const sorted = [...reviews];
  switch (currentSort) {
    case "newest":
      return sorted.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
    case "oldest":
      return sorted.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      );
    case "highest":
      return sorted.sort((a, b) => b.rating - a.rating);
    case "lowest":
      return sorted.sort((a, b) => a.rating - b.rating);
    case "helpful":
      return sorted.sort((a, b) => (b.helpful || 0) - (a.helpful || 0));
    default:
      return sorted;
  }
}

/**
 * Découpe les avis en pages
 * @param {Array} reviews - Liste des avis
 * @param {number} currentPage - Page courante
 * @param {number} reviewsPerPage - Nombre d'avis par page
 * @returns {Array} - Avis paginés
 */
export function paginateReviews(reviews, currentPage, reviewsPerPage) {
  const start = (currentPage - 1) * reviewsPerPage;
  return reviews.slice(start, start + reviewsPerPage);
}

/**
 * Échappe le contenu HTML pour éviter l'injection
 * @param {string} text - Texte à échapper
 * @returns {string} - Texte échappé
 */
export function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Formate une date dans le format localisé
 * @param {Date|string} date - Date à formater
 * @param {string} locale - Locale (ex: "fr", "en")
 * @returns {string} - Date formatée
 */
export function formatDate(date, locale = "en") {
  const d = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}
