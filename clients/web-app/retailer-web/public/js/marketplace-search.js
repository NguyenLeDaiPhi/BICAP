document.addEventListener("DOMContentLoaded", () => {
  const input = document.querySelector(".live-search");
  const grid = document.getElementById("productGrid");

  if (!input || !grid) return;

  let controller;

  input.addEventListener("input", async () => {
    const keyword = input.value.trim();

    // Abort request cũ
    if (controller) controller.abort();
    controller = new AbortController();

    try {
<<<<<<< HEAD
      // 🔹 Có keyword → search
      // 🔹 Không keyword → load full marketplace
      const url = keyword
        ? `/api/marketplace-search?name=${encodeURIComponent(keyword)}`
        : `/api/marketplace-search`;
=======
      const url = keyword
        ? `/api/fetch-marketplace-products?name=${encodeURIComponent(keyword)}`
        : `/api/fetch-marketplace-products`;
>>>>>>> 49ae5ee44aadfe2a1938c9fc96614371b4fbff2d

      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        console.error("Search failed:", res.status);
        return;
      }

      const products = await res.json();

      if (!products || products.length === 0) {
        grid.innerHTML = `<p>Không tìm thấy sản phẩm</p>`;
        return;
      }

<<<<<<< HEAD
      // ✅ RENDER CARD MỚI (GIỐNG marketplace.ejs)
=======
      // ✅ RENDER CARD MỚI (CÓ ĐỦ DATA + CLASS)
>>>>>>> 49ae5ee44aadfe2a1938c9fc96614371b4fbff2d
      grid.innerHTML = products
        .map(
          (p) => `
          <div class="product-card">

            <!-- IMAGE -->
            <div class="product-image">
              <img src="/img/product-placeholder.png" alt="${p.name}">
            </div>

            <!-- INFO -->
            <div class="product-info">
              <h3>${p.name}</h3>
              <p class="farm">Farm ID: ${p.farmId}</p>
              <p class="price">${Number(p.price).toLocaleString()} VND</p>
            </div>

            <!-- ACTION -->
            <div class="product-actions">
              <button class="btn-outline" onclick="openQr(${p.id})">
                Xem chi tiết
              </button>
<<<<<<< HEAD
              <button class="btn-primary">
=======
              <button
                class="btn-primary add-to-cart-btn"
                data-id="${p.id}"
                data-name="${p.name}"
                data-price="${p.price}"
              >
>>>>>>> 49ae5ee44aadfe2a1938c9fc96614371b4fbff2d
                Thêm vào giỏ
              </button>
            </div>

          </div>
        `
        )
        .join("");
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Search error:", err);
      }
    }
  });
});
<<<<<<< HEAD
function addToCart(productId) {
  fetch("/cart/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId }),
  }).then(res => {
=======

/* ================= ADD TO CART ================= */

// ✅ EVENT DELEGATION – BẮT CẢ BUTTON RENDER SAU SEARCH
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".add-to-cart-btn");
  if (!btn) return;

  const product = {
    id: Number(btn.dataset.id),
    name: btn.dataset.name,
    price: Number(btn.dataset.price),
  };

  fetch("/cart/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ product }),
  }).then((res) => {
>>>>>>> 49ae5ee44aadfe2a1938c9fc96614371b4fbff2d
    if (res.ok) {
      alert("Đã thêm vào giỏ hàng");
    } else {
      alert("Sản phẩm đã có trong giỏ");
    }
  });
<<<<<<< HEAD
}
document.addEventListener("click", (e) => {
  if (!e.target.classList.contains("add-to-cart-btn")) return;

  const productId = Number(e.target.dataset.id);
  addToCart(productId);
});

=======
});
>>>>>>> 49ae5ee44aadfe2a1938c9fc96614371b4fbff2d
