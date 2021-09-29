const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../index");
const should = chai.should();

chai.use(chaiHttp);

//testing user route
describe("User route", () => {
  describe("add user", () => {
    it("it should return token", (done) => {
      let user = {
        name: "Admin",
        email: "foult080@gmail.com",
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
        email: "foult080@gmail",
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
        email: "foult080@gmail.com",
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
        email: "foult080@gmail",
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
    it("shoud return error after sending non existing user", (done) => {
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
    });
  });
});

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