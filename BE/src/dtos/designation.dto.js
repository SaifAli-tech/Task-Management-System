const Joi = require("joi");

const designationDto = Joi.object({
  name: Joi.string().min(3).max(30).required().messages({
    "string.base": '"designation name" should be a type of text',
    "string.empty": '"designation name" cannot be an empty field',
    "string.min": '"designation name" should have a minimum length of {#limit}',
    "string.max": '"designation name" should have a maximum length of {#limit}',
    "any.required": '"designation name" is a required field',
  }),
});

const validate = (data) => designationDto.validate(data, { abortEarly: false });

module.exports = {
  validate,
};
