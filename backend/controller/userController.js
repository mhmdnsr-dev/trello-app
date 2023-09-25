import userModel from '../model/user.model.js';
import taskModel from '../model/task.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import sendMail from '../utils/send-verify-email.js';

const register = async (req, res) => {
  try {
    const [user] = await userModel.insertMany({
      ...req.body,
      password: bcrypt.hashSync(req.body.password, 1),
    });

    const registerToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      {
        noTimestamp: true,
      }
    );

    // const link = `${process.env.USER_VERIFY_URL}?ticket=${registerToken}`;

    // await sendMail(user, link);

    return res
      .status(201)
      .json({ status: 'success', body: { ...req.body, password: '*******' } });
  } catch (err) {
    if (err.writeErrors)
      return res.status(409).json({
        status: 'error',
        message: 'Email or phone number is already in use. Try to sign in',
      });
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

//2)
const verify = async (req, res) => {
  try {
    const { decodedToken } = req;

    const user = await userModel.findByIdAndUpdate(
      decodedToken.userId,
      { isVerified: true },
      {
        new: true,
        fields: { _id: 0, __v: 0, password: 0, isDeleted: 0, isVerified: 0 },
      }
    );

    return res.status(200).json({ status: 'success', body: user });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

// 2) login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email: email });

    let isPassed = false;
    if (user) {
      if (user.isDeleted)
        return res.status(403).json({
          status: 'error',
          message: 'Email or phone number is already in use. Try to sign in',
        });
      isPassed = bcrypt.compareSync(password, user.password);
      if (isPassed) {
        const token = jwt.sign(
          { userId: user._id },
          process.env.ACCESS_TOKEN_SECRET,
          {
            noTimestamp: true,
          }
        );

        const tasks = await taskModel.aggregate([
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
        return res.status(200).json({
          status: 'success',
          body: {
            token,
            user: {
              name: user.name,
              email: user.email,
              age: user.age,
              gender: user.gender,
              phone: user.phone,
              isVerified: user.isVerified,
            },
            tasks,
          },
        });
      }
    }

    return res.status(403).json({
      status: 'fail',
      body: {
        message: 'Wrong email or password',
      },
    });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

// 3) update user
const update = async (req, res) => {
  try {
    const { oldPass, newPass } = req.body;
    const { decodedToken } = req;

    const user = await userModel.findOne({ _id: decodedToken.userId });

    let isPassed = null;
    // If "newPass" is present, "oldPass" must be present.
    if (newPass) isPassed = bcrypt.compareSync(oldPass, user.password);

    if (isPassed === false)
      return res
        .status(406)
        .json({ status: 'fail', body: { message: 'Incorrect password' } });

    const newUser = await userModel.findByIdAndUpdate(
      decodedToken.userId,
      {
        ...req.body,
        ...(isPassed && { password: bcrypt.hashSync(newPass, 1) }),
      },
      {
        new: true,
        fields: {
          _id: 0,
          __v: 0,
          isDeleted: 0,
          isVerified: 0,
          password: 0,
        },
      }
    );
    return res.status(202).json({ status: 'success', body: newUser });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// 4) delete user
const _delete = async (req, res) => {
  try {
    const { decodedToken } = req;

    const user = await userModel.findByIdAndDelete(decodedToken.userId);

    return res.status(200).json({
      status: 'success',
      body: {
        message: `user "${user.name}" deleted successfully`,
      },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// 5) soft delete
const softDelete = async (req, res) => {
  try {
    const { authorization } = req.headers;
    const { decodedToken } = req;

    const user = await userModel.findByIdAndUpdate(decodedToken.userId, {
      isDeleted: true,
    });

    return res.status(200).json({
      status: 'success',
      body: {
        message: `user "${user.name}" deleted successfully`,
      },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// 6) logout
const logout = async (req, res) => {
  try {
    res.clearCookie('token');

    return res.status(202).json({
      status: 'success',
      body: {
        message: 'You have been logged out',
      },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export default {
  register,
  verify,
  login,
  update,
  _delete,
  softDelete,
  logout,
};
