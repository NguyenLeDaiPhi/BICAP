function updateQty(productId, delta) {
  fetch("/cart/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, delta }),
  }).then(() => location.reload());
}

document.addEventListener("click", (e) => {
  if (!e.target.classList.contains("qty-btn")) return;

  const id = Number(e.target.dataset.id);
  const delta = Number(e.target.dataset.delta);

  updateQty(id, delta);
});
