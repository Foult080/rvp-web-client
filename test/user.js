const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../index");
const should = chai.should();

chai.use(chaiHttp);
describe("User route", () => {
  describe("POST /", () => {
    it("it should return token", (done) => {
      let user = {
        name: "John Doe",
        email: "johnDoe@gmail.com",
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
        email: "johnDoe@gmail",
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
        email: "johnDoe@gmail.com",
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
});
