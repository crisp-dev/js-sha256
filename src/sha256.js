/**
 * [js-sha256]{@link https://github.com/emn178/js-sha256}
 *
 * @version 0.9.0-diet
 * @author Chen, Yi-Cyuan [emn178@gmail.com]
 * @copyright Chen, Yi-Cyuan 2014-2017
 * @license MIT
 */



var ER = 'invalid';
var AB = typeof ArrayBuffer !== 'undefined';
var HX = '0123456789abcdef'.split('');
var EX = [-2147483648, 8388608, 32768, 128];
var SH = [24, 16, 8, 0];
var K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
];

var bl = [];

function Sha256(memory) {
  if (memory) {
    bl[0] = bl[16] = bl[1] = bl[2] = bl[3] =
      bl[4] = bl[5] = bl[6] = bl[7] =
      bl[8] = bl[9] = bl[10] = bl[11] =
      bl[12] = bl[13] = bl[14] = bl[15] = 0;
    this.blocks = bl;
  } else {
    this.blocks = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  }

  this.h0 = 0x6a09e667;
  this.h1 = 0xbb67ae85;
  this.h2 = 0x3c6ef372;
  this.h3 = 0xa54ff53a;
  this.h4 = 0x510e527f;
  this.h5 = 0x9b05688c;
  this.h6 = 0x1f83d9ab;
  this.h7 = 0x5be0cd19;

  this.block = this.start = this.bytes = this.hBytes = 0;
  this.finalized = this.hashed = false;
  this.first = true;
}

Sha256.prototype.update = function (msg) {
  if (this.finalized) {
    return;
  }
  var notStr, type = typeof msg;
  if (type !== 'string') {
    if (type === 'object') {
      if (msg === null) {
        throw new Error(ER);
      } else if (AB && msg.constructor === ArrayBuffer) {
        msg = new Uint8Array(msg);
      } else if (!Array.isArray(msg)) {
        if (!AB || !ArrayBuffer.isView(msg)) {
          throw new Error(ER);
        }
      }
    } else {
      throw new Error(ER);
    }
    notStr = true;
  }
  var cd, idx = 0, i, len = msg.length, bl = this.blocks;

  while (idx < len) {
    if (this.hashed) {
      this.hashed = false;
      bl[0] = this.block;
      bl[16] = bl[1] = bl[2] = bl[3] =
        bl[4] = bl[5] = bl[6] = bl[7] =
        bl[8] = bl[9] = bl[10] = bl[11] =
        bl[12] = bl[13] = bl[14] = bl[15] = 0;
    }

    if (notStr) {
      for (i = this.start; idx < len && i < 64; ++idx) {
        bl[i >> 2] |= msg[idx] << SH[i++ & 3];
      }
    } else {
      for (i = this.start; idx < len && i < 64; ++idx) {
        cd = msg.charCodeAt(idx);
        if (cd < 0x80) {
          bl[i >> 2] |= cd << SH[i++ & 3];
        } else if (cd < 0x800) {
          bl[i >> 2] |= (0xc0 | (cd >> 6)) << SH[i++ & 3];
          bl[i >> 2] |= (0x80 | (cd & 0x3f)) << SH[i++ & 3];
        } else if (cd < 0xd800 || cd >= 0xe000) {
          bl[i >> 2] |= (0xe0 | (cd >> 12)) << SH[i++ & 3];
          bl[i >> 2] |= (0x80 | ((cd >> 6) & 0x3f)) << SH[i++ & 3];
          bl[i >> 2] |= (0x80 | (cd & 0x3f)) << SH[i++ & 3];
        } else {
          cd = 0x10000 + (((cd & 0x3ff) << 10) | (msg.charCodeAt(++idx) & 0x3ff));
          bl[i >> 2] |= (0xf0 | (cd >> 18)) << SH[i++ & 3];
          bl[i >> 2] |= (0x80 | ((cd >> 12) & 0x3f)) << SH[i++ & 3];
          bl[i >> 2] |= (0x80 | ((cd >> 6) & 0x3f)) << SH[i++ & 3];
          bl[i >> 2] |= (0x80 | (cd & 0x3f)) << SH[i++ & 3];
        }
      }
    }

    this.lastByteIndex = i;
    this.bytes += i - this.start;
    if (i >= 64) {
      this.block = bl[16];
      this.start = i - 64;
      this.hash();
      this.hashed = true;
    } else {
      this.start = i;
    }
  }
  if (this.bytes > 4294967295) {
    this.hBytes += this.bytes / 4294967296 << 0;
    this.bytes = this.bytes % 4294967296;
  }
  return this;
};

Sha256.prototype.finalize = function () {
  if (this.finalized) {
    return;
  }
  this.finalized = true;
  var bl = this.blocks, i = this.lastByteIndex;
  bl[16] = this.block;
  bl[i >> 2] |= EX[i & 3];
  this.block = bl[16];
  if (i >= 56) {
    if (!this.hashed) {
      this.hash();
    }
    bl[0] = this.block;
    bl[16] = bl[1] = bl[2] = bl[3] =
      bl[4] = bl[5] = bl[6] = bl[7] =
      bl[8] = bl[9] = bl[10] = bl[11] =
      bl[12] = bl[13] = bl[14] = bl[15] = 0;
  }
  bl[14] = this.hBytes << 3 | this.bytes >>> 29;
  bl[15] = this.bytes << 3;
  this.hash();
};

Sha256.prototype.hash = function () {
  var a = this.h0, b = this.h1, c = this.h2, d = this.h3, e = this.h4, f = this.h5, g = this.h6,
    h = this.h7, bl = this.blocks, j, s0, s1, maj, t1, t2, ch, ab, da, cd, bc;

  for (j = 16; j < 64; ++j) {
    // rightrotate
    t1 = bl[j - 15];
    s0 = ((t1 >>> 7) | (t1 << 25)) ^ ((t1 >>> 18) | (t1 << 14)) ^ (t1 >>> 3);
    t1 = bl[j - 2];
    s1 = ((t1 >>> 17) | (t1 << 15)) ^ ((t1 >>> 19) | (t1 << 13)) ^ (t1 >>> 10);
    bl[j] = bl[j - 16] + s0 + bl[j - 7] + s1 << 0;
  }

  bc = b & c;
  for (j = 0; j < 64; j += 4) {
    if (this.first) {
      ab = 704751109;
      t1 = bl[0] - 210244248;
      h = t1 - 1521486534 << 0;
      d = t1 + 143694565 << 0;
      this.first = false;
    } else {
      s0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
      s1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
      ab = a & b;
      maj = ab ^ (a & c) ^ bc;
      ch = (e & f) ^ (~e & g);
      t1 = h + s1 + ch + K[j] + bl[j];
      t2 = s0 + maj;
      h = d + t1 << 0;
      d = t1 + t2 << 0;
    }
    s0 = ((d >>> 2) | (d << 30)) ^ ((d >>> 13) | (d << 19)) ^ ((d >>> 22) | (d << 10));
    s1 = ((h >>> 6) | (h << 26)) ^ ((h >>> 11) | (h << 21)) ^ ((h >>> 25) | (h << 7));
    da = d & a;
    maj = da ^ (d & b) ^ ab;
    ch = (h & e) ^ (~h & f);
    t1 = g + s1 + ch + K[j + 1] + bl[j + 1];
    t2 = s0 + maj;
    g = c + t1 << 0;
    c = t1 + t2 << 0;
    s0 = ((c >>> 2) | (c << 30)) ^ ((c >>> 13) | (c << 19)) ^ ((c >>> 22) | (c << 10));
    s1 = ((g >>> 6) | (g << 26)) ^ ((g >>> 11) | (g << 21)) ^ ((g >>> 25) | (g << 7));
    cd = c & d;
    maj = cd ^ (c & a) ^ da;
    ch = (g & h) ^ (~g & e);
    t1 = f + s1 + ch + K[j + 2] + bl[j + 2];
    t2 = s0 + maj;
    f = b + t1 << 0;
    b = t1 + t2 << 0;
    s0 = ((b >>> 2) | (b << 30)) ^ ((b >>> 13) | (b << 19)) ^ ((b >>> 22) | (b << 10));
    s1 = ((f >>> 6) | (f << 26)) ^ ((f >>> 11) | (f << 21)) ^ ((f >>> 25) | (f << 7));
    bc = b & c;
    maj = bc ^ (b & d) ^ cd;
    ch = (f & g) ^ (~f & h);
    t1 = e + s1 + ch + K[j + 3] + bl[j + 3];
    t2 = s0 + maj;
    e = a + t1 << 0;
    a = t1 + t2 << 0;
  }

  this.h0 = this.h0 + a << 0;
  this.h1 = this.h1 + b << 0;
  this.h2 = this.h2 + c << 0;
  this.h3 = this.h3 + d << 0;
  this.h4 = this.h4 + e << 0;
  this.h5 = this.h5 + f << 0;
  this.h6 = this.h6 + g << 0;
  this.h7 = this.h7 + h << 0;
};

Sha256.prototype.hex = function () {
  this.finalize();

  var h0 = this.h0, h1 = this.h1, h2 = this.h2, h3 = this.h3, h4 = this.h4, h5 = this.h5,
    h6 = this.h6, h7 = this.h7;

  var hex = HX[(h0 >> 28) & 0x0F] + HX[(h0 >> 24) & 0x0F] +
    HX[(h0 >> 20) & 0x0F] + HX[(h0 >> 16) & 0x0F] +
    HX[(h0 >> 12) & 0x0F] + HX[(h0 >> 8) & 0x0F] +
    HX[(h0 >> 4) & 0x0F] + HX[h0 & 0x0F] +
    HX[(h1 >> 28) & 0x0F] + HX[(h1 >> 24) & 0x0F] +
    HX[(h1 >> 20) & 0x0F] + HX[(h1 >> 16) & 0x0F] +
    HX[(h1 >> 12) & 0x0F] + HX[(h1 >> 8) & 0x0F] +
    HX[(h1 >> 4) & 0x0F] + HX[h1 & 0x0F] +
    HX[(h2 >> 28) & 0x0F] + HX[(h2 >> 24) & 0x0F] +
    HX[(h2 >> 20) & 0x0F] + HX[(h2 >> 16) & 0x0F] +
    HX[(h2 >> 12) & 0x0F] + HX[(h2 >> 8) & 0x0F] +
    HX[(h2 >> 4) & 0x0F] + HX[h2 & 0x0F] +
    HX[(h3 >> 28) & 0x0F] + HX[(h3 >> 24) & 0x0F] +
    HX[(h3 >> 20) & 0x0F] + HX[(h3 >> 16) & 0x0F] +
    HX[(h3 >> 12) & 0x0F] + HX[(h3 >> 8) & 0x0F] +
    HX[(h3 >> 4) & 0x0F] + HX[h3 & 0x0F] +
    HX[(h4 >> 28) & 0x0F] + HX[(h4 >> 24) & 0x0F] +
    HX[(h4 >> 20) & 0x0F] + HX[(h4 >> 16) & 0x0F] +
    HX[(h4 >> 12) & 0x0F] + HX[(h4 >> 8) & 0x0F] +
    HX[(h4 >> 4) & 0x0F] + HX[h4 & 0x0F] +
    HX[(h5 >> 28) & 0x0F] + HX[(h5 >> 24) & 0x0F] +
    HX[(h5 >> 20) & 0x0F] + HX[(h5 >> 16) & 0x0F] +
    HX[(h5 >> 12) & 0x0F] + HX[(h5 >> 8) & 0x0F] +
    HX[(h5 >> 4) & 0x0F] + HX[h5 & 0x0F] +
    HX[(h6 >> 28) & 0x0F] + HX[(h6 >> 24) & 0x0F] +
    HX[(h6 >> 20) & 0x0F] + HX[(h6 >> 16) & 0x0F] +
    HX[(h6 >> 12) & 0x0F] + HX[(h6 >> 8) & 0x0F] +
    HX[(h6 >> 4) & 0x0F] + HX[h6 & 0x0F] +
    HX[(h7 >> 28) & 0x0F] + HX[(h7 >> 24) & 0x0F] +
    HX[(h7 >> 20) & 0x0F] + HX[(h7 >> 16) & 0x0F] +
    HX[(h7 >> 12) & 0x0F] + HX[(h7 >> 8) & 0x0F] +
    HX[(h7 >> 4) & 0x0F] + HX[h7 & 0x0F];
  return hex;
};

Sha256.prototype.toString = Sha256.prototype.hex;

Sha256.prototype.digest = function () {
  this.finalize();

  var h0 = this.h0, h1 = this.h1, h2 = this.h2, h3 = this.h3, h4 = this.h4, h5 = this.h5,
    h6 = this.h6, h7 = this.h7;

  var arr = [
    (h0 >> 24) & 0xFF, (h0 >> 16) & 0xFF, (h0 >> 8) & 0xFF, h0 & 0xFF,
    (h1 >> 24) & 0xFF, (h1 >> 16) & 0xFF, (h1 >> 8) & 0xFF, h1 & 0xFF,
    (h2 >> 24) & 0xFF, (h2 >> 16) & 0xFF, (h2 >> 8) & 0xFF, h2 & 0xFF,
    (h3 >> 24) & 0xFF, (h3 >> 16) & 0xFF, (h3 >> 8) & 0xFF, h3 & 0xFF,
    (h4 >> 24) & 0xFF, (h4 >> 16) & 0xFF, (h4 >> 8) & 0xFF, h4 & 0xFF,
    (h5 >> 24) & 0xFF, (h5 >> 16) & 0xFF, (h5 >> 8) & 0xFF, h5 & 0xFF,
    (h6 >> 24) & 0xFF, (h6 >> 16) & 0xFF, (h6 >> 8) & 0xFF, h6 & 0xFF,
    (h7 >> 24) & 0xFF, (h7 >> 16) & 0xFF, (h7 >> 8) & 0xFF, h7 & 0xFF
  ];
  return arr;
};

function HmacSha256(key, memory) {
  var i, type = typeof key;
  if (type === 'string') {
    var by = [], len = key.length, idx = 0, cd;
    for (i = 0; i < len; ++i) {
      cd = key.charCodeAt(i);
      if (cd < 0x80) {
        by[idx++] = cd;
      } else if (cd < 0x800) {
        by[idx++] = (0xc0 | (cd >> 6));
        by[idx++] = (0x80 | (cd & 0x3f));
      } else if (cd < 0xd800 || cd >= 0xe000) {
        by[idx++] = (0xe0 | (cd >> 12));
        by[idx++] = (0x80 | ((cd >> 6) & 0x3f));
        by[idx++] = (0x80 | (cd & 0x3f));
      } else {
        cd = 0x10000 + (((cd & 0x3ff) << 10) | (key.charCodeAt(++i) & 0x3ff));
        by[idx++] = (0xf0 | (cd >> 18));
        by[idx++] = (0x80 | ((cd >> 12) & 0x3f));
        by[idx++] = (0x80 | ((cd >> 6) & 0x3f));
        by[idx++] = (0x80 | (cd & 0x3f));
      }
    }
    key = by;
  } else {
    if (type === 'object') {
      if (key === null) {
        throw new Error(ER);
      } else if (AB && key.constructor === ArrayBuffer) {
        key = new Uint8Array(key);
      } else if (!Array.isArray(key)) {
        if (!AB || !ArrayBuffer.isView(key)) {
          throw new Error(ER);
        }
      }
    } else {
      throw new Error(ER);
    }
  }

  if (key.length > 64) {
    key = (new Sha256(true)).update(key).digest();
  }

  var oKeyPad = [], iKeyPad = [];
  for (i = 0; i < 64; ++i) {
    var b = key[i] || 0;
    oKeyPad[i] = 0x5c ^ b;
    iKeyPad[i] = 0x36 ^ b;
  }

  Sha256.call(this, memory);

  this.update(iKeyPad);
  this.oKeyPad = oKeyPad;
  this.inner = true;
  this.memory = memory;
}
HmacSha256.prototype = new Sha256();

HmacSha256.prototype.finalize = function () {
  Sha256.prototype.finalize.call(this);
  if (this.inner) {
    this.inner = false;
    var innerHash = this.digest();
    Sha256.call(this, this.memory);
    this.update(this.oKeyPad);
    this.update(innerHash);
    Sha256.prototype.finalize.call(this);
  }
};


var sha256 = function () {
  var method = function (msg) {
    return new Sha256(true).update(msg)["hex"]();
  };

  method.create = function () {
    return new Sha256();
  };
  method.update = function (msg) {
    return method.create().update(msg);
  };
  return method;
}();

sha256.hmac = function () {
  var method = function (key, msg) {
    return new HmacSha256(key, true).update(msg)["hex"]();
  };

  method.create = function (key) {
    return new HmacSha256(key);
  };
  method.update = function (key, msg) {
    return method.create(key).update(msg);
  };
  return method;
}();

export { sha256 };
export default sha256;
