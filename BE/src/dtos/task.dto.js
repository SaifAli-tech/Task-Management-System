const Joi = require("joi");

const taskDto = Joi.object({
  title: Joi.string().min(3).max(100).required().messages({
    "string.base": '"title" should be a type of text',
    "string.empty": '"title" is required',
    "string.min": '"title" should have a minimum length of {#limit}',
    "string.max": '"title" should have a maximum length of {#limit}',
    "any.required": '"title" is a required field',
  }),

  description: Joi.string().min(10).max(500).required().messages({
    "string.base": '"description" should be a type of text',
    "string.empty": '"description" is required',
    "string.min": '"description" should have a minimum length of {#limit}',
    "string.max": '"description" should have a maximum length of {#limit}',
    "any.required": '"description" is a required field',
  }),

  priority: Joi.string().valid("Low", "Medium", "High").required().messages({
    "any.only": '"priority" must be one of [Low, Medium, High]',
    "any.required": '"priority" is a required field',
  }),

  status: Joi.string()
    .valid("Pending", "In Progress", "Completed")
    .default("Pending")
    .messages({
      "any.only": '"status" must be one of [Pending, In Progress, Completed]',
    }),

  deadline: Joi.date().required().messages({
    "date.base": '"deadline" should be a valid date',
  }),

  assignedTo: Joi.string().required().messages({
    "string.base": '"assignedTo" must be a valid ObjectId',
    "string.empty": '"assignedTo" is required',
    "any.required": '"assignedTo" is a required field',
  }),

  createdBy: Joi.string().required().messages({
    "string.base": '"createdBy" must be a valid ObjectId',
    "string.empty": '"createdBy" is required',
    "any.required": '"createdBy" is a required field',
  }),
});

const validate = (data) => taskDto.validate(data, { abortEarly: false });

module.exports = {
  validate,
};
