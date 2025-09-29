const Joi = require("joi");

const notificationDto = Joi.object({
  title: Joi.string().required().messages({
    "string.base": '"notification title" should be a type of text',
    "string.empty": '"notification title" cannot be an empty field',
    "any.required": '"notification title" is a required field',
  }),
  text: Joi.string().required().messages({
    "string.base": '"notification text" should be a type of text',
    "string.empty": '"notification text" cannot be an empty field',
    "any.required": '"notification text" is a required field',
  }),
  for: Joi.string().required().messages({
    "string.base": '"notification for" must be a valid ObjectId',
    "string.empty": '"notification for" cannot be an empty field',
    "any.required": '"notification for" is a required field',
  }),
  read: Joi.boolean().default(false).messages({
    "boolean.base": '"read" should be a boolean',
  }),
});

const validate = (data) =>
  notificationDto.validate(data, { abortEarly: false });

module.exports = {
  validate,
};
