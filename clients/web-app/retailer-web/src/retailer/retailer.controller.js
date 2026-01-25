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
<<<<<<< HEAD
  const orders = await orderService.getMyOrders(req.user.id, token);
=======

  // ✅ KHÔNG TRUYỀN userId
  const orders = await orderService.getMyOrders(token);
>>>>>>> 49ae5ee44aadfe2a1938c9fc96614371b4fbff2d

  res.render("my-orders", {
    user: req.user,
    orders,
    pageTitle: "Đơn hàng của tôi",
  });
<<<<<<< HEAD
};

=======
  console.log("ORDERS:", orders);
console.log("TYPE:", typeof orders);
console.log("IS ARRAY:", Array.isArray(orders));

};


>>>>>>> 49ae5ee44aadfe2a1938c9fc96614371b4fbff2d
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
<<<<<<< HEAD
  res.render("profile", {
    user: req.user,
    pageTitle: "Hồ sơ cá nhân",
  });
};
=======
  const user = req.user;

  // ✅ Chuẩn hoá roles về Array<String>
  let roles = user.roles;

  if (!Array.isArray(roles)) {
    roles = [roles];
  }

  res.render("profile", {
    user: {
      username: user.username || user.sub,
      email: user.email,
      roles: roles,
    },
    pageTitle: "Hồ sơ cá nhân",
  });
};

>>>>>>> 49ae5ee44aadfe2a1938c9fc96614371b4fbff2d
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
