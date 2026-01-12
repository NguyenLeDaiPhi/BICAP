const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

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
