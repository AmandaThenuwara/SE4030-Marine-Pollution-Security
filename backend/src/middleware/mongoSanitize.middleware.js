/**
 * Middleware to sanitize user input against NoSQL Injection attacks.
 * Recursively removes any object keys starting with '$' or containing '.'
 */
function sanitizeInput(obj) {
    if (!obj || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeInput(item));
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
        if (!key.startsWith('$') && !key.includes('.')) {
            sanitized[key] = sanitizeInput(value);
        }
    }
    return sanitized;
}

function mongoSanitize(req, res, next) {
    if (req.body && typeof req.body === 'object') {
        req.body = sanitizeInput(req.body);
    }
    if (req.query && typeof req.query === 'object') {
        req.query = sanitizeInput(req.query);
    }
    if (req.params && typeof req.params === 'object') {
        req.params = sanitizeInput(req.params);
    }
    next();
}

module.exports = mongoSanitize;
