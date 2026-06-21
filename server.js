require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const session = require("express-session");

const User = require("./models/User");
const Account = require("./models/Account");
const auth = require("./middleware/auth");

const app = express();


mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB 連線成功");
  })
  .catch(err => {
    console.error("MongoDB 連線失敗");
    console.error(err);
  });

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  })
);
app.use(express.json());
const path = require("path");
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;

  const exist = await User.findOne({ username });

  if (exist) {
    return res.json({
      message: "帳號已存在"
    });
  }

  const hash = await bcrypt.hash(password, 10);

  await User.create({
    username,
    password: hash
  });

  res.json({
    message: "註冊成功"
  });
});


app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });

  if (!user) {
    return res.json({
      message: "帳號不存在"
    });
  }

  const ok = await bcrypt.compare(password, user.password);

  if (!ok) {
    return res.json({
      message: "密碼錯誤"
    });
  }

  req.session.userId = user._id;

  res.json({
    message: "登入成功"
  });
});

app.post("/api/logout", (req, res) => {
  req.session.destroy();

  res.json({
    message: "已登出"
  });
});

app.get("/api/accounts", auth, async (req, res) => {
  const data = await Account.find({
    userId: req.session.userId
  });

  res.json(data);
});

app.post("/api/accounts", auth, async (req, res) => {
  const { type, amount, note } = req.body;

  await Account.create({
    userId: req.session.userId,
    type,
    amount,
    note
  });

  res.json({
    message: "新增成功"
  });
});

app.delete("/api/accounts/:id", auth, async (req, res) => {
  await Account.deleteOne({
    _id: req.params.id,
    userId: req.session.userId
  });

  res.json({
    message: "刪除成功"
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on http://localhost:" + PORT);
});
console.log("STATIC PATH =", path.join(__dirname, "public"));
console.log(User);
console.log(Account);