const prettyFieldName = (path) => {
  const raw = Array.isArray(path) ? path[path.length - 1] : path;
  const field = typeof raw === 'string' ? raw : 'field';
  const map = {
    title: 'Title',
    price: 'Price',
    location: 'Location',
    bedrooms: 'Bedrooms',
    bathrooms: 'Bathrooms',
    area: 'Area',
    description: 'Description',
    comment: 'Comment',
    rating: 'Rating',
    phone: 'Phone',
    email: 'Email',
    username: 'Username'
  };
  return map[field] || field.charAt(0).toUpperCase() + field.slice(1);
};

const normalizeZodIssueMessage = (issue) => {
  const field = prettyFieldName(issue.path);

  switch (issue.code) {
    case 'invalid_type': {
      const expected = issue.expected;
      if (expected === 'number') return `${field} must be a number.`;
      return `Invalid value for ${field}.`;
    }
    case 'too_small': {
      if (issue.type === 'string' && typeof issue.minimum === 'number') {
        return `${field} must be at least ${issue.minimum} characters.`;
      }
      if (issue.type === 'number' && typeof issue.minimum === 'number') {
        return `${field} must be at least ${issue.minimum}.`;
      }
      return `Invalid value for ${field}.`;
    }
    case 'too_big': {
      if (issue.type === 'string' && typeof issue.maximum === 'number') {
        return `${field} must be at most ${issue.maximum} characters.`;
      }
      if (issue.type === 'number' && typeof issue.maximum === 'number') {
        return `${field} must be at most ${issue.maximum}.`;
      }
      return `Invalid value for ${field}.`;
    }
    case 'invalid_string': {
      if (issue.validation === 'email') return `Please enter a valid ${field}.`;
      return `Invalid ${field}.`;
    }
    case 'invalid_enum_value': {
      return `Invalid value for ${field}.`;
    }
    default:
      return issue.message || `Invalid value for ${field}.`;
  }
};

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    const details =
      error?.issues?.map((issue) => ({
        field: issue.path?.join('.') || 'unknown',
        message: normalizeZodIssueMessage(issue)
      })) || [];

    return res.status(400).json({
      success: false,
      errorCode: 'VALIDATION_ERROR',
      message: details[0]?.message || 'Invalid or missing data',
      details
    });
  }
};

module.exports = validate;