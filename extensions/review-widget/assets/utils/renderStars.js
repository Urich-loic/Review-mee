export function renderStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  const emptyStars = 5 - Math.ceil(rating);

  return `
    <div class="stars">
      ${'<span class="star star-full">★</span>'.repeat(fullStars)}
      ${hasHalf ? '<span class="star star-half">★</span>' : ""}
      ${'<span class="star star-empty">☆</span>'.repeat(emptyStars)}
    </div>
  `;
}
