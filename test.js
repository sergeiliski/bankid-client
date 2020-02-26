const BankID = require('./index')
const chai = require("chai")
const chaiAsPromised = require("chai-as-promised")
chai.use(chaiAsPromised)
const assert = chai.assert
const config = require('./config.js')

async function assertThrowsAsync(fn, message) {
  let f = () => {};
  try {
    await fn();
  } catch(e) {
    f = () => { throw e };
  } finally {
    assert.throws(f, message);
  }
}

describe('Initiate client', function() {
  it('Throws exception if no options', function() {
    return assert.throws(function() {
      return new BankID()
    }, 'Must include options')
  })

  it('Throws exception if no pfx or passphrase in options', function() {
    return assert.throws(function() {
      return new BankID({})
    }, 'Certificate and passphrase are required')
  })

  it('Sets url correctly', function() {
    const conf = { ...config }
    conf.baseUrl  = conf.baseUrl.slice(0, -1)
    const bankid = new BankID(conf)
    assert.equal(bankid.baseUrl, config.baseUrl)
  })
})

describe('Authenticate', function() {
  let bankid
  beforeEach(function(done) {
    bankid = new BankID(config)
    done()
  })

  it('Auth rejects if no mandatory options', async function() {
    await assertThrowsAsync(async () => {
      return await bankid.auth({})
    }, 'User ip address is required')
  })

  it('Auth returns object with orderRef and autoStartToken without personal number', async function() {
    const response = await bankid.auth({
      endUserIp: '194.168.2.25'
    })
    assert.equal(response.status, 200)
    assert.exists(response.data.orderRef)
    assert.exists(response.data.autoStartToken)

    const res = await bankid.cancel(response.data.orderRef)
    assert.equal(res.status, 200)
  })

  it('Auth returns object with orderRef and autoStartToken', async function() {
    const response = await bankid.auth({
      endUserIp: '194.168.2.25',
      personalNumber: '190000000000'
    })
    assert.equal(response.status, 200)
    assert.exists(response.data.orderRef)
    assert.exists(response.data.autoStartToken)

    const res = await bankid.cancel(response.data.orderRef)
    assert.equal(res.status, 200)
  })
})

describe('Collect', function() {
  let bankid
  beforeEach(function(done) {
    bankid = new BankID(config)
    done()
  })

  it('Collect rejects if no orderRef', async function() {
    await assertThrowsAsync(async () => {
      return await bankid.collect()
    }, 'Order reference value is required')
  })

  it('Collect returns status', async function() {
    const response = await bankid.auth({
      endUserIp: '194.168.2.25',
      personalNumber: '190000000000'
    })
    
    const res = await bankid.collect(response.data.orderRef)

    assert.equal(res.status, 200)
    assert.exists(res.data.orderRef)
    assert.exists(res.data.status)
    assert.exists(res.data.hintCode)

    await bankid.cancel(response.data.orderRef)
  })
})

describe('Sign', function() {
  let bankid
  beforeEach(function(done) {
    bankid = new BankID(config)
    done()
  })

  it('Sign rejects if no mandatory options', async function() {
    await assertThrowsAsync(async () => {
      return await bankid.sign({})
    }, 'User ip, personal number and visible data are required')
  })

  it('Sign returns object with orderRef and autoStartToken', async function() {
    const response = await bankid.sign({
      endUserIp: '194.168.2.25',
      personalNumber: '190000000000',
      userVisibleData: Buffer.from('xxxxxxxxxxx').toString('base64')
    })
    assert.equal(response.status, 200)
    assert.exists(response.data.orderRef)
    assert.exists(response.data.autoStartToken)

    const res = await bankid.cancel(response.data.orderRef)
    assert.equal(res.status, 200)
  })

  it('Sign with userNonVisibleData returns object with orderRef and autoStartToken', async function() {
    const response = await bankid.sign({
      endUserIp: '194.168.2.25',
      personalNumber: '190000000000',
      userVisibleData: Buffer.from('xxxxxxxxxxx').toString('base64'),
      userNonVisibleData: Buffer.from('xxxxxxxxxxx').toString('base64')
    })
    assert.equal(response.status, 200)
    assert.exists(response.data.orderRef)
    assert.exists(response.data.autoStartToken)

    const res = await bankid.cancel(response.data.orderRef)
    assert.equal(res.status, 200)
  })
})

describe('Cancel', function() {
  let bankid
  beforeEach(function(done) {
    bankid = new BankID(config)
    done()
  })

  it('Cancel rejects if no orderRef', async function() {
    await assertThrowsAsync(async () => {
      return await bankid.cancel()
    }, 'Order reference value is required')
  })
})

