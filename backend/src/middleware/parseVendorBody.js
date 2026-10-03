const parseJson = (value, fallback) => {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const parseVendorBody = (req, res, next) => {
  const { body, files } = req;

  if (typeof body.companyAddress === 'string') {
    body.companyAddress = parseJson(body.companyAddress, body.companyAddress);
  }
  if (typeof body.socialLinks === 'string') {
    body.socialLinks = parseJson(body.socialLinks, body.socialLinks);
  }
  if (typeof body.servicesProvided === 'string') {
    const parsed = parseJson(body.servicesProvided, null);
    body.servicesProvided = Array.isArray(parsed) ? parsed : [body.servicesProvided];
  }
  if (files?.length) body.serviceImages = files.map((file) => file.location);

  next();
};

module.exports = { parseVendorBody };