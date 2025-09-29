const Joi = require("joi");

const departmentDto = Joi.object({
  name: Joi.string().min(3).max(30).required().messages({
    "string.base": '"department name" should be a type of text',
    "string.empty": '"department name" cannot be an empty field',
    "string.min": '"department name" should have a minimum length of {#limit}',
    "string.max": '"department name" should have a maximum length of {#limit}',
    "any.required": '"department name" is a required field',
  }),
});

const validate = (data) => departmentDto.validate(data, { abortEarly: false });

module.exports = {
  validate,
};
