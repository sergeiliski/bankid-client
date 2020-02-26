'use strict'

const fs = require('fs')
const axios = require('axios')
const https = require('https')

class BankID {

  constructor(connectionOptions) {
    if (!connectionOptions) {
      throw Error('Must include options')
    }
    this.options = Object.assign({}, connectionOptions)
    if (!this.options.pfx || !this.options.passphrase) {
      throw Error('Certificate and passphrase are required')
    }
    this.baseUrl = this.options.baseUrl
    if (this.baseUrl.substr(-1) != '/') {
      this.baseUrl += '/'
    }
    this.axios = this._createAxiosInstance()
    this.authUrl = 'auth'
    this.signUrl = 'sign'
    this.collectUrl = 'collect'
    this.cancelUrl = 'cancel'
  }

  auth(data) {
    if (!data.endUserIp || !data.personalNumber) {
      throw Error('Both user ip and personal number are required')
    }

    const params = {
      endUserIp: data.endUserIp,
      personalNumber: data.personalNumber
    }

    return this.axios.post(this.baseUrl.concat(this.authUrl), params)
  }

  sign(data) {
    if (!data.endUserIp || !data.personalNumber || !data.userVisibleData) {
      throw Error('User ip, personal number and visible data are required')
    }

    let params = {
      endUserIp: data.endUserIp,
      personalNumber: data.personalNumber,
      userVisibleData: data.userVisibleData
    }

    if (data.userNonVisibleData) {
      params = Object.assign({}, params, { userNonVisibleData: data.userNonVisibleData })
    }

    return this.axios.post(this.baseUrl.concat(this.signUrl), params)
  }

  collect(orderRef) {
    if (!orderRef) {
      throw Error('Order reference value is required')
    }
    const params = {
      orderRef
    }
    return this.axios.post(this.baseUrl.concat(this.collectUrl), params)
  }

  cancel(orderRef) {
    if (!orderRef) {
      throw Error('Order reference value is required')
    }
    const params = {
      orderRef
    }
    return this.axios.post(this.baseUrl.concat(this.cancelUrl), params)
  }

  _createAxiosInstance() {
    const ca = fs.readFileSync(this.options.ca, 'utf-8')
    const pfx = fs.readFileSync(this.options.pfx)
    const passphrase = this.options.passphrase
    return axios.create({
      httpsAgent: new https.Agent({ pfx, passphrase, ca }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}

module.exports = BankID
