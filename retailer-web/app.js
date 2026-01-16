const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const session = require("express-session");

const auth = require("./src/auth/authentication");
const retailerController = require("./src/retailer/retailer.controller");

const app = express();
const PORT = 3000;

// ================= VIEW =================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "front-end", "template"));

// ================= STATIC =================
app.use("/css", express.static(path.join(__dirname, "front-end", "css")));
app.use("/js", express.static(path.join(__dirname, "public", "js")));
app.use(express.static(path.join(__dirname, "front-end")));

// ================= MIDDLEWARE =================
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(
  session({
    secret: "bicap-retailer-secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false, // true nếu dùng https
      maxAge: 1000 * 60 * 60 * 2, // 2 giờ
    },
  })
);

// ================= ROOT =================
app.get("/", (req, res) => {
  if (req.cookies.auth_token) return res.redirect("/marketplace");
  return res.redirect("/login");
});

// ================= PUBLIC =================
app.get("/login", auth.showLogin);
app.post("/login", auth.login);
app.post("/logout", auth.logout);

// ================= PAGE =================
app.get("/marketplace", auth.requireAuth, retailerController.showMarketplace);
app.get("/my-orders", auth.requireAuth, retailerController.showMyOrders);
app.get("/orders/:id", auth.requireAuth, retailerController.showOrderDetail);
app.get("/profile", auth.requireAuth, retailerController.showProfile);
app.get("/cart", auth.requireAuth, retailerController.showCart);

// ================= Cart ==================
app.post("/cart/update", auth.requireAuth, (req, res) => {
  const { id, delta } = req.body;

  if (!req.session.cart) {
    return res.status(400).json({ message: "Giỏ hàng trống" });
  }

  const item = req.session.cart.find(i => i.id == id);
  if (!item) {
    return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
  }

  item.quantity += delta;

  // ❗ Không cho nhỏ hơn 1
  if (item.quantity < 1) {
    item.quantity = 1;
  }

  res.json({
    message: "Cập nhật số lượng thành công",
    cart: req.session.cart,
  });
});


app.get("/cart", auth.requireAuth, (req, res) => {
  res.render("cart", {
    user: req.user,
    cart: req.session.cart || [],
    pageTitle: "Giỏ hàng",
  });
});

app.post("/cart/add", auth.requireAuth, (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ message: "Thiếu productId" });
  }

  if (!req.session.cart) {
    req.session.cart = [];
  }

  const exists = req.session.cart.find(i => i.id === productId);
  if (exists) {
    return res.status(400).json({ message: "Sản phẩm đã có trong giỏ" });
  }

  // ⚠️ Vì chưa có DB cart → chỉ lưu tối thiểu
  req.session.cart.push({
    id: productId,
    quantity: 1,
  });

  res.json({ message: "Đã thêm vào giỏ hàng" });
});



// ================= API – LIVE SEARCH =================
app.get("/api/marketplace-search", auth.requireAuth, async (req, res) => {
  const marketplaceService = require("./src/retailer/marketplace.service");
  const keyword = req.query.name || "";
  const products = await marketplaceService.getMarketplaceProducts(keyword);
  res.json(products);
});

// ================= START =================
app.listen(PORT, () => {
  console.log(`✅ Retailer Web running at http://localhost:${PORT}`);
});
