const { User } = require("../models");
const jwt = require("jsonwebtoken");

const { JWT_SECRET_KEY } = process.env;

const authMiddleware = async (req, res, next) => {
  const { authorization = "" } = req.headers;
  const [tokenType, token] = authorization.split(" "); //['Bearer', '<token>']

  const isTokenValid = token && tokenType === "Bearer";

  if (!isTokenValid) {
    return res.status(401).json({
      message: "로그인 후 이용 가능한 기능입니다.",
    });
  }

  try {
    const { nickname } = jwt.verify(token, JWT_SECRET_KEY);
    const user = await User.findOne({ where: { nickname } });
    res.locals.currentUser = user; //미들웨어를 걸쳐 전역에서 사용가능한 변수 생성
    next();
  } catch (err) {
    res.status(401).json({
      message: "로그인 후 이용 가능한 기능입니다.",
    });
  }
};

module.exports = authMiddleware;
