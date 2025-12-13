import { loadReviews } from "./api.js";
import { renderWidget } from "./render.js";
import { attachEventListeners } from "./events.js";

export function initWidget(widget) {
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
    appUrl: window.REVIEW_APP_URL || "https://your-app-url.com",
  };

  const state = {
    currentPage: 1,
    currentSort: "newest",
    currentFilter: "all",
    reviews: [],
    stats: {},
  };

  async function init() {
    await loadReviews(config, state, widget, renderWidget);
    attachEventListeners(widget, config, state, init);
  }

  init();
}
