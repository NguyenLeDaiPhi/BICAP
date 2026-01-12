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
      // 🔹 Có keyword → search
      // 🔹 Không keyword → load full marketplace
      const url = keyword
        ? `/api/marketplace-search?name=${encodeURIComponent(keyword)}`
        : `/api/marketplace-search`;

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

      // ✅ RENDER CARD MỚI (GIỐNG marketplace.ejs)
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
              <button class="btn-primary">
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
