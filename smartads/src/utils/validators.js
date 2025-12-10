export const validateEmail = (email) => {
  const emailRegex =
    /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.(com|edu|pk|net|org|gov|edu\.pk|com\.pk)$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  const minLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return {
    isValid: minLength && hasUpper && hasLower && hasNumber && hasSpecial,
    minLength,
    hasUpper,
    hasLower,
    hasNumber,
    hasSpecial,
  };
};
