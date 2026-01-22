document.addEventListener("click", (e) => {

  // GIẢM
  if (e.target.classList.contains("minus")) {
    const id = e.target.dataset.id;
    changeQty(id, -1);
  }

  // TĂNG
  if (e.target.classList.contains("plus")) {
    const id = e.target.dataset.id;
    changeQty(id, 1);
  }

  // XOÁ
  if (e.target.classList.contains("remove-btn")) {
    const id = e.target.dataset.id;
    removeItem(id);
  }
});

/* ======================
   UPDATE QTY
====================== */
function changeQty(id, delta) {
  fetch("/cart/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, delta })
  })
    .then(res => res.json())
    .then(data => {
      if (!data.success) return;

      const row = document.querySelector(`.cart-item[data-id="${id}"]`);
      row.querySelector(".qty").innerText = data.quantity;

      const price = Number(row.dataset.price);
      row.querySelector(".item-total").innerText =
        price * data.quantity + " VND";

      updateGrandTotal();
    });
}

/* ======================
   REMOVE ITEM
====================== */
function removeItem(id) {
  fetch("/cart/remove", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id })
  })
    .then(() => {
      document
        .querySelector(`.cart-item[data-id="${id}"]`)
        .remove();
      updateGrandTotal();
    });
}

/* ======================
   TOTAL
====================== */
function updateGrandTotal() {
  let total = 0;

  document.querySelectorAll(".cart-item").forEach(row => {
    const price = Number(row.dataset.price || 0);
    const qtyEl = row.querySelector(".qty");
    const qty = qtyEl ? Number(qtyEl.innerText) : 0;
    total += price * qty;
  });

  const totalEl = document.getElementById("grandTotal");
  if (!totalEl) return; // ⭐ FIX QUAN TRỌNG

  totalEl.innerText = total;
}


document.addEventListener("DOMContentLoaded", updateGrandTotal);


// ============= Add To Cart ===================
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("add-to-cart-btn")) {
    const btn = e.target;

    const product = {
      id: Number(btn.dataset.id),
      name: btn.dataset.name,
      price: Number(btn.dataset.price),
    };

    fetch("/cart/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("exists");
        return res.json();
      })
  }
});
/* ================= PAYMENT POPUP ================= */

document.addEventListener("DOMContentLoaded", () => {
  const checkoutBtn = document.querySelector(".btn-checkout");
  const paymentOverlay = document.getElementById("paymentOverlay");
  const paymentTotal = document.getElementById("paymentTotal");

  if (!checkoutBtn || !paymentOverlay) return;

  checkoutBtn.addEventListener("click", () => {
    paymentTotal.innerText =
      document.getElementById("grandTotal").innerText;

    paymentOverlay.classList.add("show");
  });
});

function closePayment() {
  const overlay = document.getElementById("paymentOverlay");
  if (overlay) overlay.classList.remove("show");
}


