const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body);
  if (error) throw Object.assign(new Error(error.details[0].message), { status: 400 });
  req.body = value;
  next();
};

module.exports = { validate };