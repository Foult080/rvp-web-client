const express = require("express");
const router = express.Router();
const config = require("config");
const mysql = require("mysql2/promise");
const dbConfig = require("../config/db.config2");
const { check, validationResult } = require("express-validator");
const { v4: genID } = require("uuid");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const auth = require("../middleware/auth");

/**
 * @route POST api/users
 * @desc register new user
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

    const connection = await mysql.createConnection(dbConfig);
    try {
      //check existing email
      let checkQuery = `SELECT id FROM Users WHERE email = "${email}" ;`;
      let [rows] = await connection.execute(checkQuery);
      const data = rows[0];
      if (!data.id) {
        res.status(404).json({
          errors: [{ msg: "Пользователь не найден", variant: "danger" }],
        });
      } else {
        const transporter = nodemailer.createTransport({
          host: "smtp.yandex.ru",
          port: 465,
          secure: true,
          auth: {
            user: config.get("mailer_user"),
            pass: config.get("mailer_pass"),
          },
        });
        //send email
        transporter.sendMail({
          from: "foult080@kraskrit.ru",
          to: email,
          subject: "Восстановление пароля",
          html: `<h1>Здравтсвуйте, спасибо что обратились в поддержку.</h1><p>Перейдите по следующей ссылке для восстановления пароля: www.some-url.com/restore/${data.id}</p>`,
        });
        //send message to client
        res.status(200).json({
          msg: "Ссылка для восстановления пароля отправлена на вашу почту",
          variant: "success",
        });
      }
    } catch {
      console.error(error.message);
      res.status(500).json({ errors: [{ msg: "Ошибка сервера" }] });
    }
  }
);

/**
 * @route DELETE api/users/id
 * @desc delete user
 * TODO: need make tests
 */
router.delete("/:id", auth, async function (req, res) {
  const connection = await mysql.createConnection(dbConfig);
  const id = req.params.id;
  try {
    let query = `DELETE FROM Users WHERE id="${id}"`;
    await connection.query(query);
    connection.end();
    res.status(200).json({
      msg: "Пользователь удалён",
      variant: "success",
    });
  } catch {
    console.error(error.message);
    res.status(500).json({ errors: [{ msg: "Ошибка сервера" }] });
  }
});

module.exports = router;
