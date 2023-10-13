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

// 3) login
app.post('/api/user/login', validation(userSchema.login), userCtr.login);

// 4) update
app.patch(
  '/api/user/update',
  validation(userSchema.update),
  tokenVerify,
  userCtr.update
);

// 5) getInfo
app.get('/api/user/get-data', tokenVerify, userCtr.getData);

// 6) delete
app.delete('/api/user/delete', tokenVerify, userCtr._delete);

// 7) soft delete
app.delete('/api/user/soft-delete', tokenVerify, userCtr.softDelete);

// 8) logout
app.delete('/api/user/logout', tokenVerify, userCtr.logout);

export default app;
