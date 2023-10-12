import joi from 'joi';

import joi_Date from '@joi/date';

const joiDate = joi.extend(joi_Date);

const register = joi.object({
  name: joi.string().required(),
  email: joi.string().email({ minDomainSegments: 2 }).required(),
  password: joi
    .string()
    .pattern(
      /(?=[A-Za-z0-9@#$%^&+!=]+$)^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@#$%^&+!=])(?=.{8,}).*$/
    )
    .required(),
  dateOfBirth: joiDate.date().less('now').format('YYYY-MM-DD').utc(),
  gender: joi.string(),
  phone: joi.string(),
  verifyEmail: joi.equal(true),
  verifyUrl: joi
    .string()
    .uri()
    .when('verifyEmail', { is: joi.exist(), then: joi.required() }),
});
const login = joi.object({
  email: joi.string().email({ minDomainSegments: 2 }).required(),
  password: joi.string().min(8).required(),
});

const update = joi.object({
  name: joi.string(),
  dateOfBirth: joiDate.date().less('now').format('YYYY-MM-DD').utc(),
  phone: joi.string(),
  email: joi.string().email({ minDomainSegments: 2 }),
  newPass: joi.string().min(8),
  oldPass: joi
    .string()
    .min(8)
    .when('newPass', { is: joi.exist(), then: joi.required() }),
});

export default {
  register,
  login,
  update,
};
