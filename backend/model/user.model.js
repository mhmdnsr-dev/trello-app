import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  name: Schema.Types.String,
  email: { type: Schema.Types.String, unique: true },
  password: Schema.Types.String,
  age: Schema.Types.Number,
  gender: Schema.Types.String,
  phone: { type: Schema.Types.String, unique: true },
  isVerified: { type: Schema.Types.Boolean, default: false },
  isDeleted: { type: Schema.Types.Boolean, default: false },
});

const userModel = model('User', userSchema);

export default userModel;
