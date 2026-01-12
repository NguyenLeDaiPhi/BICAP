const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "..", "..", "config", ".env"),
});

const fetch = require("node-fetch");
const jwt = require("jsonwebtoken");
const { serialize } = require("cookie");

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;
const APPLICATION_ROLE = "ROLE_RETAILER";

const JWT_SECRET_STRING =
  "YmljYXAtc2VjcmV0LWtleS1mb3Itand0LWF1dGhlbnRpY2F0aW9uCg==";
const JWT_SECRET = Buffer.from(JWT_SECRET_STRING, "base64");

// ================= HELPERS =================
const clearAuthCookie = (res) => {
  res.setHeader(
    "Set-Cookie",
    serialize("auth_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: -1,
      path: "/",
    })
  );
};

// ================= MIDDLEWARE =================
const requireAuth = (req, res, next) => {
  const token = req.cookies.auth_token;
  if (!token) return res.redirect("/login");

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // 🔑 userId = farmId = buyerId
    req.user = {
      userId: decoded.userId,
      username: decoded.sub,
      email: decoded.email,
      roles: decoded.roles || [],
    };

    // 👉 cho TẤT CẢ EJS dùng
    res.locals.user = req.user;

    next();
  } catch (err) {
    clearAuthCookie(res);
    return res.redirect("/login");
  }
};

// ================= CONTROLLERS =================
const showLogin = (req, res) => {
  if (req.cookies.auth_token) {
    return res.redirect("/marketplace");
  }
  res.render("login", { error: null });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const apiRes = await fetch(`${AUTH_SERVICE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const token = await apiRes.text();
    if (!apiRes.ok || !token) {
      return res.render("login", {
        error: "Email hoặc mật khẩu không đúng",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded.roles?.includes(APPLICATION_ROLE)) {
      return res.render("login", {
        error: "Bạn không có quyền Retailer",
      });
    }

    res.setHeader(
      "Set-Cookie",
      serialize("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      })
    );

    return res.redirect("/marketplace");
  } catch (err) {
    return res.render("login", {
      error: "Auth service unavailable",
    });
  }
};

const logout = (req, res) => {
  clearAuthCookie(res);
  res.redirect("/login");
};

module.exports = {
  requireAuth,
  showLogin,
  login,
  logout,
};
