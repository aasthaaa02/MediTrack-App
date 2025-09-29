// simple id generators (4-6 chars) prefixed as required
const { randomUUID } = require('crypto');

function shortId(prefix='A', length=5){
  // base36 from uuid
  const raw = randomUUID().replace(/-/g,'');
  const id = parseInt(raw.slice(0,12), 16).toString(36).slice(0, length).toUpperCase();
  return `${prefix}-${id}`;
}

function requestId(){
  const d = new Date();
  const yy = d.getFullYear();
  const suffix = shortId('TR',5).split('-')[1];
  return `TR-${yy}-${suffix}`;
}

function billId(){
  const d = new Date();
  const yy = d.getFullYear();
  const suffix = shortId('B',4).split('-')[1];
  return `BILL-${yy}-${suffix}`;
}

module.exports = { shortId, requestId, billId };
