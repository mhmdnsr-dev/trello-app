import { Schema, model } from 'mongoose';

const taskSchema = new Schema({
  title: Schema.Types.String,
  description: Schema.Types.String,
  status: Schema.Types.String,
  deadline: Schema.Types.Date,
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  assignTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
});

const taskModel = model('Task', taskSchema);

export default taskModel;
