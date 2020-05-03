const JWT = require('jsonwebtoken');

const verifyToken = async (req, res, next) => {
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ errors: [{ msg: 'No token, authorization denied' }] });
  }

  try {
    const decoded = JWT.verify(token, process.env.JWTSECRET);
    res.user = decoded.user;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ errors: [{ msg: 'Token is not valid, authorization denied' }] });
  }
};

module.exports = {
  verifyToken,
};
