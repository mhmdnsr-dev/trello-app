import { Router } from 'express';
import validation from '../middleware/validation/validation.js';
import userSchema from '../middleware/validation/user.Schema.js';
import userCtr from '../controller/userController.js';
import tokenVerify from '../middleware/auth/authorization.js';

const app = Router();

// 1. register
app.post(
  '/api/user/register',
  validation(userSchema.register),
  userCtr.register
);

// 2) verify
app.get('/api/user/verify', tokenVerify, userCtr.verify);

// login
app.post('/api/user/login', validation(userSchema.login), userCtr.login);

app.patch(
  '/api/user/update',
  validation(userSchema.update),
  tokenVerify,
  userCtr.update
);

app.delete('/api/user/delete', tokenVerify, userCtr._delete);

app.delete('/api/user/soft-delete', tokenVerify, userCtr.softDelete);

app.delete('/api/logout', tokenVerify, userCtr.logout);

export default app;
