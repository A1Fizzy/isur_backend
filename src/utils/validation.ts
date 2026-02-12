export const validateRegistration = (data: any) => {
  const errors: string[] = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push("Имя должно быть не менее 2 символов");
  }

  if (!data.email || !/\S+@\S+\.\S+/.test(data.email)) {
    errors.push("Некорректный email");
  }

  if (!data.password || data.password.length < 6) {
    errors.push("Пароль должен быть не менее 6 символов");
  }

  return errors;
};