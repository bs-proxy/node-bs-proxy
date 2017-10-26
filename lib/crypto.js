const simplerc4 = require('simple-rc4');
module.exports = class crypto {
	constructor (key) {
		this.rc4stream = new simplerc4(key);
		this.rc4stream.update(key);
	}

	decryptPacket (data) {
		return Buffer(this.rc4stream.update(Buffer(data)));
	}
}