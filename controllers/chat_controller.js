const ChatModel = require("../models/chat_model");
const UserModel = require("../models/user_model");
const Validator = require("node-input-validator");
// ================================================================
// -------------------------------------accessChat--------------------------
exports.accessChat = async (req, res, next) => {
  const validator = new Validator.Validator(req.body, {
    userId: "required",
  });

  const matched = await validator.check();

  if (!matched) {
    const error = Object.values(validator.errors)[0].message;
    return res.status(200).json({ success: false, message: error });
  }

  const _id = req.body.id; //current user log in id
  const userId = req.body.userId; // receiver user id

  try {
    let isChat = await ChatModel.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: _id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");

    isChat = await UserModel.populate(isChat, {
      path: "latestMessage.sender",
      select: "name profileImage email",
    });

    if (isChat.length > 0) {
      // if chat exist then send existing chat id
      // res.send(isChat[0]);
      return res
        .status(200)
        .json({ success: true, message: "", data: isChat[0] });
    } else {
      const chatData = {
        chatName: "sender",
        isGroupChat: false,
        users: [_id, userId],
      };
      const createdChat = await ChatModel.create(chatData);
      const fullChat = await ChatModel.findOne({
        _id: createdChat._id,
      }).populate("users", "-password");
      return res
        .status(200)
        .json({ success: true, message: "", data: fullChat });
    }
  } catch (error) {
    next(error);
  }
};
// ---------------------------------------fetchChats-------------------------
exports.fetchChats = async (req, res, next) => {
  // current user log in id
  const _id = req.query.id;
  try {
    let data = await ChatModel.find({
      users: { $elemMatch: { $eq: _id } },
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    data = await UserModel.populate(data, {
      path: "latestMessage.sender",
      select: "name profileImage email",
    });

    return res.status(200).json({ success: true, message: "", data });
  } catch (error) {
    next(error);
  }
};
// ------------------------------------createGroupChat----------------------------------------------------------
exports.createGroupChat = async (req, res, next) => {
  const validator = new Validator.Validator(req.body, {
    users: "required|array",
    chatName: "required",
  });

  const matched = await validator.check();

  if (!matched) {
    const error = Object.values(validator.errors)[0].message;
    return res.status(200).json({ success: false, message: error });
  }
  const users = req.body.users;
  const _id = req.body.id; // logged in user id
  const chatName = req.body.chatName;
  if (users.length < 2) {
    return res.status(400).json({
      success: false,
      message: "More than two users required to form the group",
    });
  }
  // all users including currnet users that is logged in
  users.push(_id);

  try {
    const groupChat = await ChatModel.create({
      chatName,
      users,
      isGroupChat: true,
      groupAdmin: _id,
    });

    const fullGroupChat = await ChatModel.findOne({
      _id: groupChat._id,
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    return res.status(201).json({
      success: true,
      message: "Group has been created successfully",
      data: fullGroupChat,
    });
  } catch (error) {
    next(error);
  }
};
// ------------------------------renameGroup----------------------
exports.renameGroup = async (req, res, next) => {
  const validator = new Validator.Validator(req.body, {
    chatId: "required",
    chatName: "required",
  });

  const matched = await validator.check();

  if (!matched) {
    const error = Object.values(validator.errors)[0].message;
    return res.status(200).json({ success: false, message: error });
  }
  const _id = req.body.chatId;
  const chatName = req.body.chatName;

  try {
    const data = await ChatModel.findByIdAndUpdate(
      _id,
      { chatName },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!data) {
      const error = new Error("Group not found");
      error.statusCode = 404;
      throw error;
    }
    return res
      .status(201)
      .json({ success: true, message: "updated successfully", data });
  } catch (error) {
    next(error);
  }
};
// ------------------------------------addToGroup---------------------
exports.addToGroup = async (req, res, next) => {
  const validator = new Validator.Validator(req.body, {
    chatId: "required",
    userId: "required",
  });

  const matched = await validator.check();

  if (!matched) {
    const error = Object.values(validator.errors)[0].message;
    return res.status(200).json({ success: false, message: error });
  }
  const _id = req.body.chatId;
  const userId = req.body.userId;
  try {
    const data = await ChatModel.findByIdAndUpdate(
      _id,
      {
        $push: { users: userId },
      },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    if (!data) {
      const error = new Error("Group not found");
      error.statusCode = 404;
      throw error;
    }

    return res
      .status(201)
      .json({ success: true, message: "Added successfully", data });
  } catch (error) {
    next(error);
  }
};
// ------------------------------------------removeFromGroup-----------
exports.removeFromGroup = async (req, res, next) => {
  const validator = new Validator.Validator(req.body, {
    chatId: "required",
    userId: "required",
  });

  const matched = await validator.check();

  if (!matched) {
    const error = Object.values(validator.errors)[0].message;
    return res.status(200).json({ success: false, message: error });
  }
  const _id = req.body.chatId;
  const userId = req.body.userId;
  try {
    const data = await ChatModel.findByIdAndUpdate(
      _id,
      {
        $pull: { users: userId },
      },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    if (!data) {
      const error = new Error("Group not found");
      error.statusCode = 404;
      throw error;
    }

    return res.status(201).json({
      success: true,
      message: "Removed from group successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};
