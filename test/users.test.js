const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../index");
const should = chai.should();

//mysql dependencies
const mysql = require("mysql2/promise");
const dbConfig = require("../config/db.config2");

chai.use(chaiHttp);

//delete user after test
const deleteUser = async () => {
  const connection = await mysql.createConnection(dbConfig);
  let sql = `DELETE FROM Users WHERE email = "admin@gmail.com"`;
  connection.execute(sql);
};

//testing user route
describe("User route", () => {
  describe("add user", () => {
    it("it should return token", (done) => {
      let user = {
        name: "Admin",
        email: "admin@gmail.com",
        password: "somePass",
      };
      chai
        .request(server)
        .post("/api/users")
        .send(user)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          res.body.should.have.property("token");
          done();
        });
    });
    it("after send empty object it shoud return errors", (done) => {
      chai
        .request(server)
        .post("/api/users")
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.have.property("errors");
          res.body.errors.should.be.a("array");
          done();
        });
    });
    it("after send not valid email it shoud return error", (done) => {
      let user = {
        name: "John Doe",
        email: "admin@gmail",
        password: "somePass",
      };
      chai
        .request(server)
        .post("/api/users")
        .send(user)
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.have.property("errors");
          res.body.errors.should.be.a("array");
          res.body.errors[0].should.have.property("msg");
          done();
        });
    });
    it("after send existing user it shoud return error", (done) => {
      let user = {
        name: "John Doe",
        email: "admin@gmail.com",
        password: "somePass",
      };
      chai
        .request(server)
        .post("/api/users")
        .send(user)
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.have.property("errors");
          res.body.errors.should.be.a("array");
          res.body.errors[0].should.have.property("msg");
          done();
        });
    });
  });
  describe("reset password", () => {
    it("shoud return error after sending not valid email", (done) => {
      let user = {
        email: "admin@gmail",
      };
      chai
        .request(server)
        .put("/api/users/restore")
        .send(user)
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.have.property("errors");
          res.body.errors.should.be.a("array");
          res.body.errors[0].should.have.property("msg");
          done();
        });
    });
    it("shoud return error after sending not existing user", (done) => {
      let user = {
        email: "foult0802@gmail.com",
      };
      chai
        .request(server)
        .put("/api/users/restore")
        .send(user)
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.have.property("errors");
          res.body.errors.should.be.a("array");
        });
      done();
    });
    it("shoud return ok message", (done) => {
      let user = {
        email: "foult080@gmail.com",
      };
      chai
        .request(server)
        .put("/api/users/restore")
        .send(user)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
        });
      done();
      deleteUser();
    });
  });
});
