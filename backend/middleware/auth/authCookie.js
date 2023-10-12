import jwt from 'jsonwebtoken';

const tokenCookieVerify = (req, res, next) => {
  try {
    const token = req.headers.cookie?.split('=')[1];

    if (!token)
      return res.status(401).json({
        status: 'fail',
        body: { message: 'Not Authentication' },
      });

    req.decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') res.status(401);
    else res.status(500);

    return res.json({ status: 'error', message: err.message });
  }
};
export default tokenCookieVerify;
