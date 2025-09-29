const Joi = require("joi");

const userDto = Joi.object({
  firstName: Joi.string().min(3).max(30).required().messages({
    "string.base": '"first name" should be a type of text',
    "string.empty": '"first name" is required',
    "string.min": '"first name" should have a minimum length of {#limit}',
    "string.max": '"first name" should have a maximum length of {#limit}',
    "any.required": '"first name" is a required field',
  }),

  lastName: Joi.string().min(3).max(30).required().messages({
    "string.base": '"last name" should be a type of text',
    "string.empty": '"last name" is required',
    "string.min": '"last name" should have a minimum length of {#limit}',
    "string.max": '"last name" should have a maximum length of {#limit}',
    "any.required": '"last name" is a required field',
  }),

  userName: Joi.string().min(6).max(30).required().messages({
    "string.base": '"user name" should be a type of text',
    "string.empty": '"user name" is required',
    "string.min": '"user name" should have a minimum length of {#limit}',
    "string.max": '"user name" should have a maximum length of {#limit}',
    "any.required": '"user name" is a required field',
  }),

  email: Joi.string().email().required().messages({
    "string.base": '"email" should be a type of text',
    "string.empty": '"email" is required',
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
      "string.empty": '"employeeNumber" is required',
      "any.required": '"employeeNumber" is a required field',
    }),

  password: Joi.string().min(6).required().messages({
    "string.base": '"password" should be a type of text',
    "string.empty": '"password" is required',
    "string.min": '"password" should have a minimum length of {#limit}',
    "any.required": '"password" is a required field',
  }),

  designation: Joi.string().required().messages({
    "string.base": '"designation" must be a valid ObjectId',
    "string.empty": '"designation" is required',
    "any.required": '"designation" is a required field',
  }),

  department: Joi.string().required().messages({
    "string.base": '"department" must be a valid ObjectId',
    "string.empty": '"department" is required',
    "any.required": '"department" is a required field',
  }),

  image: Joi.string().required().messages({
    "string.base": '"image" should be a type of text',
    "string.empty": '"image" is required',
    "any.required": '"image" is a required field',
  }),

  approved: Joi.boolean().default(false).messages({
    "boolean.base": '"approved" should be a boolean',
  }),
});

const validate = (data) => userDto.validate(data, { abortEarly: false });

module.exports = {
  validate,
};
