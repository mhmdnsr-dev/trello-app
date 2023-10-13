import joi from 'joi';
import joi_Date from '@joi/date';

const joiDate = joi.extend(joi_Date);

const add = joi.object({
  title: joi.string().required(),
  description: joi.string(),
  status: joi.string().equal('todo', 'doing', 'done').required(),
  deadline: joiDate
    .date()
    .greater('now')
    .format('YYYY-MM-DD')
    .utc()
    .required(true),
  assignTo: joi.string().email({ minDomainSegments: 2 }),
});
const update = joi.object({
  title: joi.string(),
  description: joi.string(),
  status: joi.string().equal('todo', 'doing', 'done'),
  deadline: joiDate.date().greater('now').format('YYYY-MM-DD').utc(),
  assignTo: joi.string().email({ minDomainSegments: 2 }),
});

export default { add, update };
