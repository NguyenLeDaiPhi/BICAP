const api = require("../../config/axios");

/**
 * Retailer (Buyer) lấy đơn hàng
 * farmId == userId == buyerId
 */
const getOrdersByBuyer = async (token, userId) => {
  const res = await api.get("/api/orders", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      farmId: userId,
    },
  });

  return res.data;
};

module.exports = {
  getOrdersByBuyer,
};
