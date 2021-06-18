import joi from 'joi';

const userSchema = joi.object({
  username: joi.string().alphanum().min(3).max(30).required(),
  email: joi.string().email().required(),
  password: joi.string().min(6).required(),
  passwordConfirmation: joi.ref('password'),
  birthYear: joi.number().integer().min(1900).max(2013),
});

export default userSchema;