import taskModel from '../model/task.model.js';
import userModel from '../model/user.model.js';

const add = async (req, res) => {
  try {
    const { decodedToken } = req;

    const { assignTo } = req.body;

    const to = await userModel.findOne({ email: assignTo });
    const user = await userModel.findById(decodedToken.userId);

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
          description: task.description,
          status: task.status,
          deadline: task.deadline,
          assignFrom: {
            name: user.name,
            email: user.email,
          },
          assignTo: {
            name: to?.name || user.name,
            email: to?.email || user.email,
          },
        },
        ...(!to && {
          note: 'The sent email does not represent any user and therefore the task is assigned to you',
        }),
      },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
const update = async (req, res) => {
  try {
    const { decodedToken } = req;
    const { taskId } = req;
    const { assignTo } = req.body;
    const targetTask = await taskModel.findById(taskId);

    if (targetTask.userId.toString() !== decodedToken.userId)
      return res.status(403).json({
        status: 'fail',
        body: { message: 'You do not have permission to modify this task' },
      });
    const to = await userModel.findOne({ email: assignTo });
    !to && delete req.body.assignTo;
    const task = await taskModel.findByIdAndUpdate(
      taskId,
      { ...req.body, ...(!to || { assignTo: to._id }) },
      {
        new: true,
        fields: {
          __v: 0,
        },
      }
    );

    if (!task)
      return res
        .status(404)
        .json({ status: 'error', message: `Can't found this task` }); //Most likely this will not happen

    const actualAssign = await userModel.findById(task.assignTo);
    const ownerTask = await userModel.findById(task.userId);

    const taskData = task.toObject();

    delete taskData.userId;

    return res.status(202).json({
      status: 'success',
      body: {
        task: {
          ...taskData,
          assignFrom: {
            name: ownerTask.name,
            email: ownerTask.email,
          },
          assignTo: {
            name: to?.name || actualAssign.name,
            email: to?.email || actualAssign.email,
          },
        },
        ...(!to && {
          note: 'The email assigned does not represent any user',
        }),
      },
    });
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

const _delete = async (req, res) => {
  try {
    const { taskId } = req;
    const { decodedToken } = req;

    const targetTask = await taskModel.findById(taskId);
    if (targetTask.userId.toString() !== decodedToken.userId)
      return res.status(403).json({
        status: 'fail',
        body: { message: 'You do not have permission to modify this task' },
      });

    const task = await taskModel.findByIdAndDelete(taskId);
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
      message: err.message,
    });
  }
};
const all = async (req, res) => {
  try {
    const { decodedToken } = req;
    const { deadline } = req.body;
    const user = await userModel.findOne({ _id: decodedToken.userId });
    let tasks = await taskModel.aggregate([
      { $match: { $or: [{ userId: user._id }, { assignTo: user._id }] } },
      {
        $lookup: {
          from: 'users',
          localField: 'assignTo',
          foreignField: '_id',
          as: 'assignTo',
        },
      },
      { $unwind: '$assignTo' },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'assignFrom',
        },
      },
      { $unwind: '$assignFrom' },
      {
        $project: {
          title: 1,
          description: 1,
          status: 1,
          deadline: 1,
          'assignTo.name': 1,
          'assignTo.email': 1,
          'assignFrom.name': 1,
          'assignFrom.email': 1,
        },
      },
    ]);

    deadline && (tasks = tasks.filter(task => task.deadline > new Date()));

    if (!tasks.length)
      return res
        .status(204)
        .json({ status: 'fail', body: { message: 'Not found any task' } });
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
