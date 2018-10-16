'use strict'

const fs = require('fs')
const soap = require('soap')
const xml2js = require('xml2js')

class BankID {
  constructor(options) {
    if (!options) {
      throw new Error('Must include options.');
    }
    this.client = null;
    this.authRef = null;
    this.id = null;
    this.client = null;
    this.options = options;
  }

  connect(personalNumber) {
    if(!personalNumber) {
      throw new Error('Must contain personal number.');
    }
    const options = {
      wsdl_options: {
        cert: fs.readFileSync(this.options.cert),
        key: fs.readFileSync(this.options.key),
        passphrase: this.options.passphrase,
        strictSSL: this.options.strictSSL ? this.options.strictSSL : false
      }
    }
    return new Promise((resolve, reject) => {
      soap.createClient(this.options.url, options, (err, client) => {
        if (err) {
          reject(Error(err))
        } else {
          this.id = personalNumber
          this.client = client
          this.client.setSecurity(new soap.ClientSSLSecurity(
            this.options.key,
            this.options.cert,
            {
              strictSSL: this.options.strictSSL ? this.options.strictSSL : false,
              passphrase: this.options.passphrase
            }
          ))
          resolve(client)
        }
      })
    })
  }

  authenticate() {
    let args = { personalNumber: this.id };
    return new Promise((resolve, reject) => {
      this.client.Authenticate(args, (err, result) => {
        if (err) {
          const parser = new xml2js.Parser();
          parser.parseString(err.body, function(err, result) {
            if (err) {
              reject(new Error(err));
            }
            if (
              result &&
              result['soap:Envelope'] &&
              result['soap:Envelope']['soap:Body'] &&
              result['soap:Envelope']['soap:Body'][0] &&
              result['soap:Envelope']['soap:Body'][0]['soap:Fault'] &&
              result['soap:Envelope']['soap:Body'][0]['soap:Fault'][0] &&
              result['soap:Envelope']['soap:Body'][0]['soap:Fault'][0]['faultstring'] &&
              result['soap:Envelope']['soap:Body'][0]['soap:Fault'][0]['faultstring'][0]
            ) {
              resolve({
                error: result['soap:Envelope']['soap:Body'][0]['soap:Fault'][0]['faultstring'][0]
              });
            }
            reject(new Error(err));
          })
        } else {
          resolve({
            orderRef: result.orderRef,
            autoStartToken: result.autoStartToken
          });
        }
      })
    })
  }

  cancelAuthenticate() {
    const args = { personalNumber: this.id };
    return new Promise((resolve, reject) => {
      this.client.Authenticate(args, (err, result) => {
        if (err) {
          const parser = new xml2js.Parser();
          parser.parseString(err.body, function(err, result) {
            if (err) {
              reject(new Error(err));
            }
            if (
              result &&
              result['soap:Envelope'] &&
              result['soap:Envelope']['soap:Body'] &&
              result['soap:Envelope']['soap:Body'][0] &&
              result['soap:Envelope']['soap:Body'][0]['soap:Fault'] &&
              result['soap:Envelope']['soap:Body'][0]['soap:Fault'][0] &&
              result['soap:Envelope']['soap:Body'][0]['soap:Fault'][0]['faultstring'] &&
              result['soap:Envelope']['soap:Body'][0]['soap:Fault'][0]['faultstring'][0] === 'ALREADY_IN_PROGRESS'
            ) {
              resolve('AUTH_CANCELLED')
            }
          })
          reject(new Error(err));
        } else {
          this.cancelAuthenticate()
        }
      })
    })
  }

  collect(orderRef) {
    return new Promise((resolve, reject) => {
      this.client.Collect(orderRef, (err, result) => {
        if (err) {
          const parser = new xml2js.Parser();
          parser.parseString(err.body, function(err, result) {
            if (err) {
              reject(new Error(err));
            }
            if (
              result &&
              result['soap:Envelope'] &&
              result['soap:Envelope']['soap:Body'] &&
              result['soap:Envelope']['soap:Body'][0] &&
              result['soap:Envelope']['soap:Body'][0]['soap:Fault'] &&
              result['soap:Envelope']['soap:Body'][0]['soap:Fault'][0] &&
              result['soap:Envelope']['soap:Body'][0]['soap:Fault'][0]['faultstring'] &&
              result['soap:Envelope']['soap:Body'][0]['soap:Fault'][0]['faultstring'][0]
            ) {
              resolve(result['soap:Envelope']['soap:Body'][0]['soap:Fault'][0]['faultstring'][0]);
            }
          })
          reject(Error(err));
        } else {
          resolve(result);
        }
      })
    })
  }

  sign(data) {
    const args = {
      personalNumber: this.id,
      userVisibleData: data.userVisibleData,
      userNonVisibleData: data.userNonVisibleData
    };
    return new Promise((resolve, reject) => {
      this.client.Sign(args, (err, result) => {
        if (err) {
          const parser = new xml2js.Parser()
          parser.parseString(err.body, function(err, result) {
            if (err) {
              reject(new Error(err));
            }
            if (
              result &&
              result['soap:Envelope'] &&
              result['soap:Envelope']['soap:Body'] &&
              result['soap:Envelope']['soap:Body'][0] &&
              result['soap:Envelope']['soap:Body'][0]['soap:Fault'] &&
              result['soap:Envelope']['soap:Body'][0]['soap:Fault'][0] &&
              result['soap:Envelope']['soap:Body'][0]['soap:Fault'][0]['faultstring'] &&
              result['soap:Envelope']['soap:Body'][0]['soap:Fault'][0]['faultstring'][0]
            ) {
              resolve({
                error: result['soap:Envelope']['soap:Body'][0]['soap:Fault'][0]['faultstring'][0]
              });
            }
          })
          reject(new Error(err));
        } else {
          resolve({
            orderRef: result.orderRef,
            autoStartToken: result.autoStartToken
          });
        }
      })
    })
  }

  cancelSign() {
    const args = {
      personalNumber: this.id,
      userVisibleData: Buffer.from('Cancel').toString('base64'),
      userNonVisibleData: Buffer.from('Cancel').toString('base64')
    };
    return new Promise((resolve, reject) => {
      this.client.Sign(args, (err, result) => {
        if (err) {
          const parser = new xml2js.Parser()
          parser.parseString(err.body, function(err, result) {
            if (err) {
              reject(new Error(err));
            }
            if (
              result &&
              result['soap:Envelope'] &&
              result['soap:Envelope']['soap:Body'] &&
              result['soap:Envelope']['soap:Body'][0] &&
              result['soap:Envelope']['soap:Body'][0]['soap:Fault'] &&
              result['soap:Envelope']['soap:Body'][0]['soap:Fault'][0] &&
              result['soap:Envelope']['soap:Body'][0]['soap:Fault'][0]['faultstring'] &&
              result['soap:Envelope']['soap:Body'][0]['soap:Fault'][0]['faultstring'][0] === 'ALREADY_IN_PROGRESS'
            ) {
              resolve('SIGN_CANCELLED');
            }
          })
          reject(new Error(err));
        } else {
          this.cancelSign()
        }
      })
    })
  }
}

module.exports = BankID
