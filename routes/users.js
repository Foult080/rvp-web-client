const express = require("express");
const router = express.Router();
const config = require("config");
const mysql = require("mysql2/promise");
const dbConfig = require("../config/db.config");
const { check, validationResult } = require("express-validator");
const { v4: genID } = require("uuid");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

/**
 * @route POST api/users
 * @desc register new user
 * TODO: need make tests
 */
router.post(
  "/",
  [
    check("name", "Укажите имя пользователя").not().isEmpty(),
    check("email", "Укажите корректный email").not().isEmpty().isEmail(),
    check("password", "Укажите пароль").not().isEmpty().isLength({ min: 8 }),
  ],
  async (req, res) => {
    //validate req
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      //get data from request
      const { name, email, password } = req.body;
      const connection = await mysql.createConnection(dbConfig);

      //check existing email
      let checkQuery = `SELECT email FROM Users WHERE email = "${email}" ;`;
      let [rows] = await connection.execute(checkQuery);
      if (rows.length) {
        res.status(400).json({
          errors: [
            { msg: "Пользователь уже зарегистрирован", variant: "success" },
          ],
        });
      } else {
        //hash pass
        const salt = await bcrypt.genSalt(10);
        let newPassword = await bcrypt.hash(password, salt);
        let userID = genID();
        console.log(userID.length);
        //save user record
        await connection.execute(
          `INSERT INTO Users (id,name,email, password) VALUES ('${userID}','${name}','${email}', '${newPassword}')`
        );
        connection.end();
        //generate token
        const payload = {
          user: {
            id: userID,
          },
        };
        //TODO: change expires in
        jwt.sign(
          payload,
          config.get("jwt"),
          { expiresIn: 36000 },
          (error, token) => {
            if (error) throw error;
            res.json({ token });
          }
        );
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ errors: [{ msg: "Ошибка сервера" }] });
    }
  }
);

/**
 * @route POST api/users/restore
 * @desc send restore email to user
 * TODO: need make tests
 */
router.put(
  "/restore",
  [
    check("email", "Укажите пользователя базы данных")
      .not()
      .isEmpty()
      .isEmail(),
  ],
  async (req, res) => {
    //validate req
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    //get data drom req
    const { email } = req.body;
    try {
      //TODO: credentials for sender email
      const transporter = nodemailer.createTransport({
        host: "smtp.yandex.ru",
        port: 465,
        secure: true,
        auth: {
          user: "foult080@kraskrit.ru",
          pass: ";/JycnAc7@;E=2%",
        },
      });
      //send email
      await transporter.sendMail({
        from: "foult080@kraskrit.ru",
        to: email,
        subject: "Восстановление пароля",
        html: "<b>Hello world!</b>",
      });
      //send message to client
      res
        .status(200)
        .json({ msg: "Ссылка для восстановления пароля отправлена на вашу почту", variant: "success" });
    } catch {
      console.error(error.message);
      res.status(500).json({ errors: [{ msg: "Ошибка сервера" }] });
    }
  }
);

module.exports = router;
