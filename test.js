const BankID = require('./');
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const soap = require('soap')
chai.use(chaiAsPromised);
const assert = chai.assert;
const config = require('./config.js')

describe('Initiate client', function() {
  it('Throws exception if no options', function() {
    return assert.throws(function() {
      return new BankID();
    }, 'Must include options.');
  });

  it('Loads bankid client', function() {
    return assert(new BankID(config) instanceof BankID);
  });
});

describe('Connection', function() {
  let bankid;
  beforeEach(function(done) {
    bankid = new BankID(config);
    done();
  });

  it('Throws exception if no personal number', function() {
    return assert.throws(function() {
      return bankid.connect();
    }, 'Must contain personal number.');
  });

  it('Connection is established', function() {
    return bankid.connect('198605082695')
    .then(function(connection) {
      assert(connection instanceof soap.Client);
    });
  });
});

describe('Authenticate', function() {
  let bankid;
  beforeEach(function(done) {
    bankid = new BankID(config);
    bankid.connect('198605082695')
    .then(function() {
      done();
    });
  });

  it('Authenticate returns object with orderRef and autoStartToken', function() {
    return bankid.authenticate()
      .then(function(connection) {
        assert.exists(connection.orderRef);
        assert.exists(connection.autoStartToken);
      })
  });

  it('cancelAuthenticate cancels the authentications process', function() {
    return bankid.cancelAuthenticate()
      .then(function(response) {
        assert.equal(response, 'AUTH_CANCELLED');
      })
  });

  it('Handle cancelAuthenticate if called when nothing to cancel', function() {
    return bankid.cancelAuthenticate()
      .then(function(response) {
        assert.equal(response, 'AUTH_CANCELLED');
      })
  });
});

describe('Sign', function() {
  let bankid;
  beforeEach(function(done) {
    bankid = new BankID(config);
    bankid.connect('198605082694')
    .then(function() {
      done();
    });
  });

  it('Sign returns object with orderRef and autoStartToken', function() {
    return bankid.sign({
      userVisibleData: Buffer.from('test').toString('base64'),
      userNonVisibleData: Buffer.from('test').toString('base64')
    })
      .then(function(connection) {
        assert.exists(connection.orderRef);
        assert.exists(connection.autoStartToken);
      })
  });

  it('cancelSign cancels the authentications process', function() {
    return bankid.cancelSign()
      .then(function(response) {
        assert.equal(response, 'SIGN_CANCELLED');
      })
  });

  it('Handle cancelSign if called when nothing to cancel', function() {
    return bankid.cancelSign()
      .then(function(response) {
        assert.equal(response, 'SIGN_CANCELLED');
      })
  });
});

