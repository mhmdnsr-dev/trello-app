import { Schema, model } from 'mongoose';

const taskSchema = new Schema({
  title: Schema.Types.String,
  description: Schema.Types.String,
  status: Schema.Types.String,
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  assignTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  deadline: Schema.Types.Date,
});

const taskModel = model('Task', taskSchema);

export default taskModel;
