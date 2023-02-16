const express = require("express");
const { sequelize } = require("./models");
const authRouter = require("./routes/auth");
const postRouter = require("./routes/posts");
const commentRouter = require("./routes/comments");
// const authMiddleware = require("./middleware"); 이걸쓰게 되면 모든 과정에서 로그인검사를 하기에 문제발생함

const app = express();

app.use(express.json());
// app.use(authMiddleware);

app.use("/", authRouter); //미들웨어란 무엇인가?
app.use("/posts", postRouter);
app.use("/comments", commentRouter);

app.listen(3000, async () => {
  console.log("3000번 서버 가동");
  await sequelize.authenticate();
  console.log("db authenticate");
});
