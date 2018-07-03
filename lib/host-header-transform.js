'use strict';

const bsplit = require('buffer-split');
const {Transform} = require('stream');

class HostHeaderTransform extends Transform {
  constructor(targetHost, options) {
    super(options);
    this._targetHost = targetHost;
    this._NEWLINE_BUFFER = Buffer.from('\n');
  }
  _handleLineBuf(buf) {
    const headerRegex = /^(host:\s?)\s*[a-z0-9\-.:]+\s*\r$/i;
    const str = buf.toString();
    if (headerRegex.test(str)) {
      const replacedStr = str.replace(headerRegex, `$1${this._targetHost}\r`);
      this.push(Buffer.from(replacedStr));
    } else {
      this.push(buf);
    }
    this.push(this._NEWLINE_BUFFER);
  }
  _transform(chunk, encoding, done) {
     if (this._lastLineData) {
       chunk = Buffer.concat([this._lastLineData, chunk]);
     }

     const lineBufs = bsplit(chunk, this._NEWLINE_BUFFER);
     this._lastLineData = lineBufs.splice(lineBufs.length - 1, 1)[0];

     lineBufs.forEach(this._handleLineBuf.bind(this));
     done();
  }
  _flush(done) {
     if (this._lastLineData) {
       this._handleLineBuf(this._lastLineData);
     }
     this._lastLineData = null;
     done();
  }
}

module.exports = HostHeaderTransform;
