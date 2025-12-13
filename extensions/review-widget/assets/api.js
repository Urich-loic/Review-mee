export async function loadReviews(config, state, widget, renderFn) {
  try {
    const response = await fetch(
      `${config.appUrl}/api/storefront/reviews?productId=${config.productId}&shop=${config.shop}`
    );
    if (!response.ok) throw new Error("Failed to fetch");
    const data = await response.json();
    state.reviews = data.reviews || [];
    state.stats = data.stats || { avgRating: 0, totalReviews: 0 };
    renderFn(widget, config, state);
  } catch (error) {
    console.error("Error loading reviews:", error);
    widget.innerHTML = `<div class="review-error"><p>Unable to load reviews at this time.</p></div>`;
  }
}

export async function markHelpful(reviewId, config, state, widget, renderFn) {
  try {
    await fetch(`${config.appUrl}/api/storefront/reviews/${reviewId}/helpful`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shop: config.shop }),
    });
    await loadReviews(config, state, widget, renderFn);
  } catch (error) {
    console.error("Error marking helpful:", error);
  }
}
