import { Router } from 'express';
import validation from '../middleware/validation/validation.js';
import taskSchema from '../middleware/validation/task.Schema.js';
import tokenVerify from '../middleware/auth/authorization.js';
import taskCtr from '../controller/taskController.js';
import validationId from '../middleware/validation/taskId.js';

const app = Router();

//  1) add
app.post('/api/task/add', tokenVerify, validation(taskSchema.add), taskCtr.add);

// 2) update
app.patch(
  '/api/task/update/:id',
  validation(taskSchema.update),
  tokenVerify,
  validationId,
  taskCtr.update
);

// 3) delete
app.delete('/api/task/delete/:id', tokenVerify, validationId, taskCtr._delete);

// 4) get all
app.get('/api/task/all', tokenVerify, taskCtr.all);

export default app;
