export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

export const validatePassword = (password) => {
  return password.length >= 6
}

export const validateForm = (data, rules) => {
  const errors = {}

  Object.keys(rules).forEach(field => {
    const rule = rules[field]
    const value = data[field]

    if (rule.required && !value) {
      errors[field] = `${rule.label} is required`
    } else if (rule.type === 'email' && value && !validateEmail(value)) {
      errors[field] = 'Invalid email address'
    } else if (rule.type === 'password' && value && !validatePassword(value)) {
      errors[field] = 'Password must be at least 6 characters'
    } else if (rule.minLength && value && value.length < rule.minLength) {
      errors[field] = `${rule.label} must be at least ${rule.minLength} characters`
    } else if (rule.maxLength && value && value.length > rule.maxLength) {
      errors[field] = `${rule.label} must be at most ${rule.maxLength} characters`
    }
  })

  return errors
}