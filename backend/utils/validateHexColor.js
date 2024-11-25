const validateHexColor = (color) => {
  const regex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

  return regex.test(color);
};

export default validateHexColor;
