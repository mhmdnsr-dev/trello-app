import joi from 'joi';

const register = joi.object({
  name: joi.string().required(),
  email: joi.string().email({ minDomainSegments: 2 }).required(),
  password: joi.string().min(6).required(),
  age: joi.number(),
  gender: joi.string(),
  phone: joi.string().required(),
});
const login = joi.object({
  email: joi.string().email({ minDomainSegments: 2 }).required(),
  password: joi.string().min(6).required(),
});

const update = joi.object({
  name: joi.string(),
  age: joi.number(),
  gender: joi.string(),
  phone: joi.string(),
  email: joi.string().email({ minDomainSegments: 2 }),
  newPass: joi.string().min(6),
  oldPass: joi
    .string()
    .min(6)
    .when('newPass', { is: joi.exist(), then: joi.required() }),
});

export default {
  register,
  login,
  update,
};
