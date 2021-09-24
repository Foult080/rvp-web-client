const express = require("express");
const router = express.Router();
const dbConnect = require("./config/db-connect");

/**
 * @route POST api/users
 * @desc register new user
 * TODO: need make tests
 */
router.post(
  "/",
  [
    check("host", "Укажите адрес хоста для подключения").not().isEmpty(),
    check("username", "Укажите пользователя базы данных").not().isEmpty(),
    check("password", "Укажите пароль базы данных").not().isEmpty(),
  ],
  async (req, res) => {
    //validate requset
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      //get data from request
      const { name, email, password } = req.body;
      let checkQuery = "SELECT Users.email FROM Users;";
      let data = await dbConnect.query(checkQuery);
      if (data) {
        res.staus(400).json({
          errors: [
            { msg: "Пользователь уже зарегистрирован", variant: "success" },
          ],
        });
      } else {
        //hash pass
        const salt = await bcrypt.genSalt(10);
        let newPassword = await bcrypt.hash(password, salt);
        dbConnect.query(`INSERT INTO Users VALUES (name, email, newPassword)`);
      }
    } catch {
      console.error(error.message);
      res.status(500).json({ errors: [{ msg: "Ошибка сервера" }] });
    }
  }
);

module.exports = router;
