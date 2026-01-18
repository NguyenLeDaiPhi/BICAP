const api = require("../../config/axios");

const getMarketplaceProducts = async (keyword = "") => {
  try {
    let url = "/api/marketplace-products";

    if (keyword && keyword.trim() !== "") {
      url += `?name=${encodeURIComponent(keyword.trim())}`;
    }

    const res = await api.get(url);
    return res.data;
  } catch (err) {
    console.error("Marketplace API error:", err.message);
    return [];
  }
};

module.exports = {
  getMarketplaceProducts,
};
