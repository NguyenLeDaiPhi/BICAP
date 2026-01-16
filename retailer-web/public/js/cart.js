document.addEventListener("click", (e) => {
  if (e.target.classList.contains("qty-btn")) {
    const id = e.target.dataset.id;
    const delta = Number(e.target.dataset.delta);

    updateQty(id, delta);
  }
});

function updateQty(id, delta) {
  fetch("/cart/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, delta }),
  }).then(() => location.reload());
}
