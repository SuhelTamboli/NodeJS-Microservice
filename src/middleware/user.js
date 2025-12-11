const blockFields = (fields = []) => {
  return (req, res, next) => {
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        res.status(400).send({
          msg: `${field} cannot be updated`,
          error: `Field '${field}' is not allowed in update`,
          data: null,
        });
      }
    });
    next();
  };
};

module.exports = {
  blockFields,
};
