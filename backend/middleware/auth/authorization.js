import jwt from 'jsonwebtoken';

const tokenVerify = (req, res, next) => {
  try {
    const { authorization } = req.headers;

    if (!authorization)
      return res.status(401).json({
        status: 'fail',
        body: { message: 'token authorization is require' },
      });

    const token = authorization.split(' ')[1];

    req.decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') res.status(401);
    else res.status(500);

    return res.json({ status: 'error', message: err.message });
  }
};
export default tokenVerify;
