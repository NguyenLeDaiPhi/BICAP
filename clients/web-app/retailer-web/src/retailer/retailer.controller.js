const marketplaceService = require("./marketplace.service");
const orderService = require("./order.service");

const showMarketplace = async (req, res) => {
  const keyword = req.query.name || "";
  const token = req.cookies.auth_token;
  const products = await marketplaceService.getMarketplaceProducts(
    keyword,
    token
  );

  res.render("marketplace", {
    user: req.user,
    products,
    pageTitle: "Marketplace",
    query: keyword, // ⭐ BẮT BUỘC
  });
};

const showMyOrders = async (req, res) => {
  const token = req.cookies.auth_token;
  const orders = await orderService.getMyOrders(req.user.id, token);

  res.render("my-orders", {
    user: req.user,
    orders,
    pageTitle: "Đơn hàng của tôi",
  });
};

const showOrderDetail = async (req, res) => {
  const token = req.cookies.auth_token;
  const order = await orderService.getOrderDetail(req.params.id, token);

  res.render("order-detail", {
    user: req.user,
    order,
    pageTitle: "Chi tiết đơn hàng",
  });
};

const showProfile = (req, res) => {
  res.render("profile", {
    user: req.user,
    pageTitle: "Hồ sơ cá nhân",
  });
};
const showCart = (req, res) => {
  res.render("cart", {
    user: req.user,
    cart: req.session.cart || [],
    total: 0,
    pageTitle: "Giỏ hàng",
  });
};

module.exports = {
  showMarketplace,
  showMyOrders,
  showOrderDetail,
  showProfile,
  showCart,
};
