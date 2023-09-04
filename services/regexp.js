// const titleValidate = (title) => {
//   const regex = /^[\u0400-\u04FF\s-]+$/;

//   return regex.test(title);
// };

// const descriptionValidate = (description) => {
//   const regex = /^[а-яА-Яa-zA-Z0-9\s\-.,!?;:]+$/;

//   return regex.test(description);
// };

const passwordValidate = (password) => {
  const regex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]+$/;

  return regex.test(password);
};

module.exports = { passwordValidate };
