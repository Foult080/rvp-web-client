//express
const express = require("express");
const router = express.Router();
//validator
const { check, validationResult } = require("express-validator");
//check authentication
const auth = require("../middleware/Auth");
//mysql
const mysql = require("mysql2/promise");
const dbConfig = require("../config/db.config2");
//dependencies
const config = require("config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

//check match of password and user pass
const isMatch = (password, userPass) => {
  return bcrypt.compare(password, userPass);
};

/**
 * @route POST api/auth
 * @desc authenticate user
 * TODO: tests
 */
router.post(
  "/",
  [
    check("email", "Укажите корректный Email адрес").not().isEmpty().isEmail(),
    check("password", "Укажите правильный пароль от записи").not().isEmpty(),
  ],
  async (req, res) => {
    //check errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    //get data from request
    const { email, password } = req.body;
    try {
      //create connection and run query
      const connection = await mysql.createConnection(dbConfig);
      let query = `SELECT id, email, password FROM Users WHERE email = "${email}";`;
      const [row] = await connection.query(query);
      //get data from array
      const data = row[0];
      //check data exists and equals of passrds
      if (data && (await isMatch(password, data.password))) {
        const payload = {
          user: {
            id: data.id,
          },
        };
        //TODO: expires in
        await jwt.sign(
          payload,
          config.get("jwt"),
          { expiresIn: 36000 },
          (err, token) => {
            if (err) throw err;
            res.json({ token });
          }
        );
      } else {
        res.status(401).json({
          errors: [{ msg: "Укажите корректные данные", variant: "danger" }],
        });
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ errors: [{ msg: "Ошибка сервера" }] });
    }
  }
);

module.exports = router;
