export function renderSort(state) {
  return `
    <div class="review-sort">
      <label>Trier par:</label>
      <select class="sort-select">
        <option value="newest" ${state.currentSort === "newest" ? "selected" : ""}>Plus récent</option>
        <option value="oldest" ${state.currentSort === "oldest" ? "selected" : ""}>Plus ancien</option>
        <option value="highest" ${state.currentSort === "highest" ? "selected" : ""}>Mieux noté</option>
        <option value="lowest" ${state.currentSort === "lowest" ? "selected" : ""}>Moins bien noté</option>
        <option value="helpful" ${state.currentSort === "helpful" ? "selected" : ""}>Plus utile</option>
      </select>
    </div>
  `;
}
