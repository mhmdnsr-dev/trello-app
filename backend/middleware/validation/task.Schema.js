import joi from 'joi';
import joi_Date from '@joi/date';

const joiDate = joi.extend(joi_Date);

const add = joi.object({
  title: joi.string().required().max(15),
  description: joi.string().min(15),
  status: joi.string().equal('todo', 'doing', 'done').required(),
  deadline: joiDate
    .date()
    .greater('now')
    .format('DD-MM-YYYY')
    .utc()
    .required(true),
  assignTo: joi.string().email({ minDomainSegments: 2 }),
});
const update = joi.object({
  title: joi.string().max(15),
  description: joi.string().min(10),
  status: joi.string().equal('todo', 'doing', 'done'),
  deadline: joiDate.date().greater('now').format('DD-MM-YYYY').utc(),
});

export default { add, update };
