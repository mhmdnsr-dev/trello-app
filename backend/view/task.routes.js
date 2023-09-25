import { Router } from 'express';
import validation from '../middleware/validation/validation.js';
import taskSchema from '../middleware/validation/task.Schema.js';
import tokenVerify from '../middleware/auth/authorization.js';
import taskCtr from '../controller/taskController.js';

const app = Router();

app.post('/api/task/add', validation(taskSchema.add), tokenVerify, taskCtr.add);

app.patch(
  '/api/task/update/:id',
  validation(taskSchema.update),
  tokenVerify,
  taskCtr.update
);

app.delete('/api/task/delete/:id', tokenVerify, taskCtr._delete);

app.get('/api/task/all', tokenVerify, taskCtr.all);

export default app;
