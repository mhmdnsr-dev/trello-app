const validation = schema => (req, res, next) => {
  try {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map(d => d.message);
      return res
        .status(406)
        .json({ status: 'error', message: errors.join(' / ') });
    }
    next();
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
export default validation;
