const api = require("../../config/axios");

<<<<<<< HEAD
const getMyOrders = async (userId, token) => {
  try {
    const res = await api.get("/api/orders", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        // farmId is used in the backend for filtering orders by retailer
        farmId: userId,
      },
=======
const getMyOrders = async (token) => {
  try {
    const res = await api.get("/api/orders/my", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
>>>>>>> 49ae5ee44aadfe2a1938c9fc96614371b4fbff2d
    });
    return res.data;
  } catch (err) {
    console.error("Order API error:", err.message);
    return [];
  }
};

const getOrderDetail = async (orderId, token) => {
  try {
<<<<<<< HEAD
    const res = await api.get(`/api/orders/${orderId}`, {
=======
    const res = await api.get(`/api/orders/detail/${orderId}`, {
>>>>>>> 49ae5ee44aadfe2a1938c9fc96614371b4fbff2d
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (err) {
    console.error("Order API error:", err.message);
    return null;
  }
};

<<<<<<< HEAD
module.exports = {
  getMyOrders,
  getOrderDetail,
};
=======

module.exports = {
  getMyOrders,
  getOrderDetail,
};
>>>>>>> 49ae5ee44aadfe2a1938c9fc96614371b4fbff2d
