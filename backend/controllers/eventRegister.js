const randToken = require("rand-token");
const Razorapy = require("razorpay");
const crypto = require("crypto");
const eventReg = require("../models/eventRegister");

const genToken = () => {
  return "EK" + randToken.generate(6);
};

exports.eventRegister = async (req, res) => {
  const { name, category, event, eventCode, email, phone, paid, paymentMode } =
    req.body;

  const isReg = await eventReg.findOne({
    eventCode,
    email,
  });

  if (isReg) {
    return res.status(400).json({
      success: false,
      code: "REG_EXISTS",
      message: "You are already registered for this event",
    });
  }

  const newEventReg = new eventReg({
    name,
    category,
    event,
    email,
    phone,
    eventCode,
    tokenId: genToken(),
    paid,
    paymentMode,
  });

  try {
    await newEventReg.save();
    res.status(201).json({
      success: true,
      data: {
        newEventReg,
      },
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};

exports.getRegistrations = async (req, res) => {
  try {
    const eventRegistrations = await eventReg.find({});
    res.status(200).json({
      success: true,
      data: {
        eventRegistrations,
      },
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};

exports.getDetails = async (req, res) => {
  const { email, eventCode } = req.body;

  try {
    const registration = await eventReg.findOne({ email, eventCode });
    res.status(200).json({
      success: true,
      registration,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};

exports.getRegistrationById = async (req, res) => {
  const { id } = req.params;

  try {
    const registration = await eventReg.findById(id);

    if (!registration) {
      return res.status(404).json({
        success: false,
        code: "REG_NOT_FOUND",
        message: "Registration not found",
      });
    }

    res.status(200).json({
      success: true,
      registration,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};

exports.sendOrder = async (req, res) => {
  const { amount, eventCode, email } = req.body;

  const isReg = await eventReg.findOne({
    eventCode,
    email,
  });

  if (isReg) {
    return res.status(400).json({
      success: false,
      code: "REG_EXISTS",
      message: "You are already registered for this event",
    });
  }

  const options = {
    amount,
    currency: "INR",
    receipt: randToken.generate(8),
    payment_capture: 1,
  };

  try {
    const instance = new Razorapy({
      key_id: process.env.RAZOR_KEY_ID,
      key_secret: process.env.RAZOR_SECRET_KEY,
    });

    const response = await instance.orders.create(options);

    res.status(200).json({
      success: true,
      order: {
        ...response,
        key_id: process.env.RAZOR_KEY_ID,
      },
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};

exports.confirmRegistration = async (req, res) => {
  const SECRET = process.env.RAZOR_VERIFY_SECRET;

  const shashum = crypto.createHmac("sha256", SECRET);
  shashum.update(JSON.stringify(req.body));
  const hash = shashum.digest("hex");

  if (hash === req.headers["x-razorpay-signature"]) {
    try {
      const {
        payload: {
          payment: { entity },
        },
      } = req.body;

      const arr = entity.description.split(",");

      const newEventReg = new eventReg({
        name: entity.card.name,
        email: entity.email,
        phone: entity.contact.substr(3),
        category: arr[1],
        event: arr[2],
        eventCode: arr[0],
        tokenId: genToken(),
        paid: true,
        paymentMode: "Online",
      });

      await newEventReg.save();

      res.status(200).json({
        success: true,
      });
    } catch (err) {
      console.log(err);
      res.status(400).json({
        success: false,
        message: err,
      });
    }
  } else {
    res.status(400).json({
      success: false,
    });
  }
};
