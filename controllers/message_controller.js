const MessageModel = require("../models/message_model");
const Validator = require("node-input-validator");
const UserModel = require("../models/user_model");
const ChatModel = require("../models/chat_model");
//==============================================sendMessage==============================================
exports.sendMessage = async (req, res, next) => {
  const validator = new Validator.Validator(req.body, {
    chatId: "required",
    content: "required",
  });

  const matched = await validator.check();

  if (!matched) {
    const error = Object.values(validator.errors)[0].message;
    return res.status(200).json({ success: false, message: error });
  }

  const { chatId, content, id } = req.body; // here id is logged user id
  try {
    let message = await MessageModel.create({
      sender: id,
      content: content,
      chat: chatId,
    });

    message = await message.populate("sender", "name profileImage");

    message = await message.populate("chat");

    message = await UserModel.populate(message, {
      path: "chat.users",
      select: "name profileImage email",
    });

    // update latest message in chat model
    await ChatModel.findByIdAndUpdate(chatId, { latestMessage: message });

    return res.status(201).json({ success: true, message: "", data: message });
  } catch (error) {
    next(error);
  }
};

//------------------------------------------getAllMessage----------------------------------------------
exports.getAllMessage = async (req, res, next) => {
  const validator = new Validator.Validator(req.query, {
    chatId: "required|string",
  });

  const matched = await validator.check();

  if (!matched) {
    const error = Object.values(validator.errors)[0].message;
    return res.status(200).json({ success: false, message: error });
  }

  const chatId = req.query.chatId;

  try {
    const data = await MessageModel.find({ chat: chatId })
      .populate("sender", "name profileImage email")
      .populate("chat");
    return res.status(200).json({ success: true, message: "", data });
  } catch (error) {
    next(error);
  }
};
