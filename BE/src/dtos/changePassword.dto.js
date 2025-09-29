const Joi = require("joi");

const changePasswordDto = Joi.object({
  password: Joi.string().min(6).required().messages({
    "string.base": '"password" should be a type of text',
    "string.empty": '"password" cannot be an empty field',
    "string.min": '"password" should have a minimum length of {#limit}',
    "any.required": '"password" is a required field',
  }),
});

const validate = (data) =>
  changePasswordDto.validate(data, { abortEarly: false });

module.exports = {
  validate,
};
