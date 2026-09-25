const sanitizeHtml = require('sanitize-html');

/**
 * Sanitization options: Strip all executable script tags, iframes, objects, and event handlers
 */
const sanitizeOptions = {
  allowedTags: [], // Strip all HTML tags completely for raw text fields
  allowedAttributes: {},
  disallowedTagsMode: 'discard',
};

/**
 * Recursively sanitize strings in objects or arrays
 */
function sanitizeValue(value) {
  if (typeof value === 'string') {
    return sanitizeHtml(value, sanitizeOptions).trim();
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value !== null && typeof value === 'object') {
    const cleaned = {};
    for (const key of Object.keys(value)) {
      cleaned[key] = sanitizeValue(value[key]);
    }
    return cleaned;
  }
  return value;
}

/**
 * Express middleware to sanitize req.body, req.query, and req.params
 */
function sanitizeInputs(req, res, next) {
  if (req.body) {
    req.body = sanitizeValue(req.body);
  }
  if (req.query) {
    req.query = sanitizeValue(req.query);
  }
  if (req.params) {
    req.params = sanitizeValue(req.params);
  }
  next();
}

module.exports = { sanitizeInputs, sanitizeValue };
