BankID Client
=============================
Bankid client to interact with BankID services.

## Requirements

- A certificate and a key issued by a certified Bank.

Installation
------------

```bash
npm install bankid-client
```

How to use
----------

### 1) Import `bankid-client`

```js
var BankID = require('bankid-client');
```

Create a bankid instance, e.g.

```js
var options = {
  'cert': '<path_to_cert>',
  'key': '<path_to_key>',
  'passphrase': '',
  'url': '<url_to_bankid>'
};
var bankid = new BankID(options);
```

### 2) Connect
```js
bankid.connect(personalNumber)
.then(function() {
  // Connection established.
});
```

### 3) Authenticate

```js
bankid.authenticate()
.then(function(response) {
  // Authentication process has started.
});

// Example response.
{ 
  orderRef: '16e3f0bc-45f6-4b34-b596-0ff7379aac43',
  autoStartToken: '1b17909b-3eb7-4abf-a49d-ced055182370' 
}
```

### 4) Sign

```js
var options = {
  userVisibleData: Buffer.from('show_this').toString('base64'),
  userNonVisibleData: Buffer.from('sign_this').toString('base64')
};
bankid.sign(options)
.then(function(response) {
  // Signing process has started.
});

// Example response.
{ 
  orderRef: '16e3f0bc-45f6-4b34-b596-0ff7379aac43',
  autoStartToken: '1b17909b-3eb7-4abf-a49d-ced055182370' 
}
```

### 5) Collect
```js
bankid.collect(orderRef)
.then(function(response) {
  // Status collected.
});

// Example response.
// https://www.bankid.com/assets/bankid/rp/bankid-relying-party-guidelines-v2.16.pdf
{
 progressStatus: 'USER_SIGN'
}
```

### 6) cancelAuthenticate && cancelSign
```js
bankid.cancelAuthenticate()
.then(function(response) {
  // Authentication cancelled.
  // response: AUTH_CANCELLED
});

bankid.cancelSign()
.then(function(response) {
  // Signing cancelled.
  // response: SIGN_CANCELLED
});
```

License
-------

The MIT License (MIT)

Copyright (c) 2018 Sergei Liski

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.