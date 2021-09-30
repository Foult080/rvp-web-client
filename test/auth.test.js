const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../index");
const should = chai.should();

chai.use(chaiHttp);

//testing auth route
describe("AUTH route", () => {
  describe("get token", () => {
    it("it should return token", (done) => {
      let user = {
        email: "foult080@gmail.com",
        password: "12345678",
      };
      chai
        .request(server)
        .post("/api/auth")
        .send(user)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          res.body.should.have.property("token");
          done();
        });
    });
    it("shoud return error if user does not exist", (done) => {
      let user = {
        email: "foult0808@gmail.com",
        password: "12345678",
      };
      chai
        .request(server)
        .post("/api/auth")
        .send(user)
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.have.property("errors");
          res.body.errors.should.be.a("array");
        });
      done();
    });
    it("shoud return error after sending not valid email", (done) => {
      let user = {
        email: "foult080@gmail",
        password: "12345678",
      };
      chai
        .request(server)
        .post("/api/auth")
        .send(user)
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.have.property("errors");
          res.body.errors.should.be.a("array");
          res.body.errors[0].should.have.property("msg");
        });
      done();
    });
  });
});
