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
    this.id = null;
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
        strictSSL: false
      }
    }
    return new Promise((resolve, reject) => {
      return soap.createClient(this.options.url, options, (err, client) => {
        if (err) {
          return reject(new Error(err))
        } else {
          this.id = personalNumber
          this.client = client
          this.client.setSecurity(new soap.ClientSSLSecurity(
            this.options.key,
            this.options.cert,
            {
              strictSSL: false,
              passphrase: this.options.passphrase
            }
          ))
          return resolve(client)
        }
      })
    })
  }

  authenticate() {
    let args = { personalNumber: this.id };
    return new Promise((resolve, reject) => {
      return this.client.Authenticate(args, (err, result) => {
        if (err) {
          const parser = new xml2js.Parser();
          parser.parseString(err.body, function(err, result) {
            if (err) {
              return reject(new Error(err));
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
              return resolve({
                error: result['soap:Envelope']['soap:Body'][0]['soap:Fault'][0]['faultstring'][0]
              });
            }
          })
          return reject(new Error(err));
        } else {
          return resolve({
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
      return this.client.Authenticate(args, (err, result) => {
        if (err) {
          const parser = new xml2js.Parser();
          parser.parseString(err.body, function(err, result) {
            if (err) {
              return reject(new Error(err));
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
              return resolve('AUTH_CANCELLED')
            }
          })
          return reject(new Error(err));
        } else {
          return resolve(this.cancelAuthenticate());
        }
      })
    })
  }

  collect(orderRef) {
    return new Promise((resolve, reject) => {
      if (!orderRef || typeof orderRef !== 'string') {
        return reject('orderRef is required in a string format.');
      }

      return this.client.Collect(orderRef, (err, result) => {
        if (err) {
          const parser = new xml2js.Parser();
          parser.parseString(err.body, function(err, result) {
            if (err) {
              return reject(new Error(err));
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
              return resolve(result['soap:Envelope']['soap:Body'][0]['soap:Fault'][0]['faultstring'][0]);
            }
          })
          return reject(new Error(err));
        } else {
          return resolve(result);
        }
      })
    })
  }

  sign(data) {
    return new Promise((resolve, reject) => {
      if (!data || typeof data !== 'object') {
        return reject('Signable data is required.');
      }
  
      if (!data.userNonVisibleData || !data.userNonVisibleData) {
        return reject('Both userNonVisibleData and userVisibleData is required.');
      }
  
      const args = {
        personalNumber: this.id,
        userVisibleData: data.userVisibleData,
        userNonVisibleData: data.userNonVisibleData
      };

      return this.client.Sign(args, (err, result) => {
        if (err) {
          const parser = new xml2js.Parser()
          parser.parseString(err.body, function(err, result) {
            if (err) {
              return reject(new Error(err));
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
              return resolve({
                error: result['soap:Envelope']['soap:Body'][0]['soap:Fault'][0]['faultstring'][0]
              });
            }
          })
          return reject(new Error(err));
        } else {
          return resolve({
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
      return this.client.Sign(args, (err, result) => {
        if (err) {
          const parser = new xml2js.Parser()
          parser.parseString(err.body, function(err, result) {
            if (err) {
              return reject(new Error(err));
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
              return resolve('SIGN_CANCELLED');
            }
          })
          return reject(new Error(err));
        } else {
          return resolve(this.cancelSign());
        }
      })
    })
  }
}

module.exports = BankID
