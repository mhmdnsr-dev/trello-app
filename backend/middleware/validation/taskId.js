const validationId = (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ status: 'error', message: `the id is require` }); //Most likely this will not happen
    }
    req.taskId = id;
    next();
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
export default validationId;
