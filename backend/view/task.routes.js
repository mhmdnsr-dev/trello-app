import { Router } from 'express';
import validation from '../middleware/validation/validation.js';
import taskSchema from '../middleware/validation/task.Schema.js';
import tokenCookieVerify from '../middleware/auth/authCookie.js';
import taskCtr from '../controller/taskController.js';
import validationId from '../middleware/validation/taskId.js';

const app = Router();

//  1) add
app.post(
  '/api/task/add',
  tokenCookieVerify,
  validation(taskSchema.add),
  taskCtr.add
);

// 2) update
app.patch(
  '/api/task/update/:id',
  validation(taskSchema.update),
  tokenCookieVerify,
  validationId,
  taskCtr.update
);

// 3) delete
app.delete(
  '/api/task/delete/:id',
  tokenCookieVerify,
  validationId,
  taskCtr._delete
);

// 4) get all
// app.get('/api/task/all', tokenCookieVerify, taskCtr.all);

export default app;
