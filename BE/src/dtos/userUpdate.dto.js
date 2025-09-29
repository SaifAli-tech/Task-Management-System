const Joi = require("joi");

const userUpdateDto = Joi.object({
  firstName: Joi.string().min(3).max(30).required().messages({
    "string.base": '"first name" should be a type of text',
    "string.empty": '"first name" cannot be an empty field',
    "string.min": '"first name" should have a minimum length of {#limit}',
    "string.max": '"first name" should have a maximum length of {#limit}',
    "any.required": '"first name" is a required field',
  }),

  lastName: Joi.string().min(3).max(30).required().messages({
    "string.base": '"last name" should be a type of text',
    "string.empty": '"last name" cannot be an empty field',
    "string.min": '"last name" should have a minimum length of {#limit}',
    "string.max": '"last name" should have a maximum length of {#limit}',
    "any.required": '"last name" is a required field',
  }),

  userName: Joi.string().min(6).max(30).required().messages({
    "string.base": '"user name" should be a type of text',
    "string.empty": '"user name" cannot be an empty field',
    "string.min": '"user name" should have a minimum length of {#limit}',
    "string.max": '"user name" should have a maximum length of {#limit}',
    "any.required": '"user name" is a required field',
  }),

  email: Joi.string().email().required().messages({
    "string.base": '"email" should be a type of text',
    "string.empty": '"email" cannot be an empty field',
    "string.email": '"email" must be a valid email',
    "any.required": '"email" is a required field',
  }),

  employeeNumber: Joi.string()
    .pattern(/^EMP-\d{4}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Invalid employee number format. Use format: EMP-1234",
      "string.base": '"employeeNumber" should be a type of text',
      "string.empty": '"employeeNumber" cannot be an empty field',
      "any.required": '"employeeNumber" is a required field',
    }),

  designation: Joi.string().messages({
    "string.base": '"designation" should be a type of text',
    "string.empty": '"designation" cannot be an empty field',
  }),

  department: Joi.string().messages({
    "string.base": '"department" should be a type of text',
    "string.empty": '"department" cannot be an empty field',
  }),

  image: Joi.string().required().messages({
    "string.base": '"image" should be a type of text',
    "string.empty": '"image" cannot be an empty field',
    "any.required": '"image" is a required field',
  }),

  status: Joi.string()
    .valid("Approved", "Not Approved")
    .default("Not Approved")
    .messages({
      "string.base": '"status" should be a type of text',
      "any.only": '"status" must be either "Approved" or "Not Approved"',
    }),
});

const validate = (data) => userUpdateDto.validate(data, { abortEarly: false });

module.exports = {
  validate,
};
