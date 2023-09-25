import taskModel from '../model/task.model.js';
import userModel from '../model/user.model.js';

const add = async (req, res) => {
  try {
    const { decodedToken } = req;

    const { assignTo } = req.body;

    const to = await userModel.findOne({ email: assignTo });

    const [task] = await taskModel.insertMany({
      ...req.body,
      userId: decodedToken.userId,
      assignTo: to?._id || decodedToken.userId,
    });

    return res.status(201).json({
      status: 'success',
      body: {
        task: {
          _id: task._id,
          title: task.title,
          discription: task.description,
          status: task.status,
          deadline: task.deadline,
          ...(to && { assignTo }),
        },
        ...(to?._id || {
          note: 'The sent email does not represent any user and therefore the task is assigned to you',
        }),
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
const update = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id)
      return res
        .status(400)
        .json({ status: 'error', message: `the id is require` }); //Most likely this will not happen

    const task = await taskModel.findByIdAndUpdate(
      id,
      { ...req.body },
      {
        new: true,
        fields: {
          _id: 0,
          userId: 0,
          assignTo: 0,
          __v: 0,
        },
      }
    );
    if (!task)
      return res
        .status(404)
        .json({ status: 'error', message: `Can't found this task` }); //Most likely this will not happen
    return res.status(202).json({ status: 'success', body: { task } });
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: err.kind === 'ObjectId' ? 'Invalid id' : err.message,
    });
  }
};

const _delete = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id)
      return res
        .status(400)
        .json({ status: 'error', message: `the id is require` }); //Most likely this will not happen

    const task = await taskModel.findByIdAndDelete(id);
    if (!task)
      return res
        .status(404)
        .json({ status: 'error', message: `Can't found this task` }); //Most likely this will not happen
    res
      .status(200)
      .json({ status: 'success', body: { message: 'Task has been deleted' } });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.kind === 'ObjectId' ? 'Invalid id' : err.message,
    });
  }
};
const all = async (req, res) => {
  try {
    const { decodedToken } = req;
    const { deadline } = req.body;
    const user = await userModel.findOne({ _id: decodedToken.userId });
    let tasks = await taskModel.aggregate([
      { $match: { userId: user._id } },
      {
        $lookup: {
          from: 'users',
          localField: 'assignTo',
          foreignField: '_id',
          as: 'to',
        },
      },
      { $unwind: '$to' },
      {
        $project: {
          title: 1,
          description: 1,
          status: 1,
          deadline: 1,
          'to.name': 1,
          'to.email': 1,
        },
      },
    ]);

    deadline && (tasks = tasks.filter(task => task.deadline > new Date()));

    if (!tasks.length)
      return res
        .status(204)
        .json({ status: 'fail', body: 'Not found any task' });
    else return res.status(200).json({ status: 'success', body: { tasks } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export default {
  add,
  update,
  _delete,
  all,
};
