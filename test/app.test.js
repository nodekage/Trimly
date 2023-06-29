const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server'); 

chai.use(chaiHttp);
const expect = chai.expect;

describe('URL Shortener API', () => {
  describe('GET /', () => {
    it('should return an array of short URLs', (done) => {
      chai
        .request(app)
        .get('/')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('array');
          done();
        });
    });
  });

  describe('POST /shortUrls', () => {
    it('should create a short URL', (done) => {
      chai
        .request(app)
        .post('/shortUrls')
        .send({
          fullUrl: 'https://example.com/long-url',
        })
        .end((err, res) => {
          expect(res).to.have.status(302);
          // Add more assertions as needed
          done();
        });
    });
  });

  describe('GET /{test}', () => {
    it('should redirect to the full URL', (done) => {
      chai
        .request(app)
        .get('/{test}')
        .end((err, res) => {
          expect(res).to.redirect;
          expect(res).to.have.status(302);
          // Add more assertions as needed
          done();
        });
    });
  });
});
