import userModel from '../model/user.model.js';
import taskModel from '../model/task.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import sendMail from '../utils/send-verify-email.js';

// 1) register
const register = async (req, res) => {
  try {
    const [user] = await userModel.insertMany({
      ...req.body,
      password: bcrypt.hashSync(req.body.password, 1),
    });

    const registerToken = jwt.sign(
      { email: user.email },
      process.env.ACCESS_TOKEN_SECRET
    );

    const { verifyEmail, verifyUrl } = req.body;

    if (verifyEmail) {
      // url for frontend page which then send verify request with "token" from query(search params)
      const link = `${verifyUrl}?token=${registerToken}`;

      await sendMail(user, link);

      delete req.body.verifyEmail;
      delete req.body.verifyUrl;
    }

    return res.status(201).json({
      status: 'success',
      body: { user: { ...req.body, password: '********' } },
    });
  } catch (err) {
    if (err.writeErrors)
      return res.status(406).json({
        status: 'fail',
        body: {
          message: 'Email is already in use. Try to sign in',
        },
      });
    return res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

//2) verify
const verify = async (req, res) => {
  try {
    const { decodedToken } = req;

    const user = await userModel.findOneAndUpdate(
      { email: decodedToken.email },
      { isVerified: true },
      {
        new: true,
        fields: { _id: 0, __v: 0, password: 0, isDeleted: 0, isVerified: 0 },
      }
    );

    return res.status(200).json({ status: 'success', body: { user } });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

// 3) login
const login = async (req, res) => {
  try {
    let isPassed = false;
    let reactivation = false;

    const { email, password } = req.body;
    const user = await userModel.findOne({ email: email });

    if (user) {
      isPassed = bcrypt.compareSync(password, user.password);
      if (isPassed) {
        if (user.isDeleted) {
          user.isDeleted = false;
          user.save();
          reactivation = true;
        }
        const token = jwt.sign(
          { userId: user._id },
          process.env.ACCESS_TOKEN_SECRET
        );

        // res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Secure; SameSite=None`);
        res.cookie('token', token, {
          httpOnly: true,
          secure: true,
          sameSite: 'None',
        });

        return res
          .status(200)
          .json({ status: 'success', body: { reactivation } });
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

// 4) get user info
const getData = async (req, res) => {
  try {
    const { decodedToken } = req;

    const user = await userModel.findById(decodedToken.userId, {
      isDeleted: 0,
      __v: 0,
      password: 0,
    });
    const tasks = await taskModel.aggregate([
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
    return res.status(200).json({ status: 'success', body: { user, tasks } });
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
    newPass && (isPassed = bcrypt.compareSync(oldPass, user.password));

    if (isPassed === false)
      return res
        .status(406)
        .json({ status: 'fail', body: { message: 'Incorrect password' } });

    const updatedUser = await userModel.findByIdAndUpdate(
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
    return res.status(202).json({ status: 'success', body: { updatedUser } });
  } catch (err) {
    if (err.writeErrors)
      return res.status(406).json({
        status: 'fail',
        body: {
          message: 'Email is already in use.',
        },
      });

    return res.status(500).json({ status: 'error', message: err.message });
  }
};

// 4) delete user
const _delete = async (req, res) => {
  try {
    const { decodedToken } = req;

    await taskModel.deleteMany({ userId: decodedToken.userId });
    const user = await userModel.findByIdAndDelete(decodedToken.userId);

    res.clearCookie('token', {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
    });

    return res.status(200).json({
      status: 'success',
      body: {
        message: `user "${user.name}" deleted successfully`,
      },
    });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

// 5) soft delete
const softDelete = async (req, res) => {
  try {
    //const { authorization } = req.headers;
    const { decodedToken } = req;

    res.clearCookie('token', {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
    });

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
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

// 6) logout
const logout = async (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
    });
    return res.status(202).json({
      status: 'success',
      body: {
        message: 'You have been logged out',
      },
    });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

export default {
  register,
  verify,
  login,
  getData,
  update,
  _delete,
  softDelete,
  logout,
};
