'use strict';

var net = require('net');
var fs = require('fs');
var util = require('util');
var path = require('path');
var jsome = require('jsome');
var options = require('./util/usage').options;
const colors = require('colors');
var PacketReceiver = require('./lib/packetreceiver');
var cryptoClass = require('./lib/crypto');
var Definitions = require('./lib/definitions');
var EMsg = require('./enums/emsg');

var definitions = new Definitions(options);
var clients = {};
if(options.replay) {
    fs.readFile(options.replay.filename, {encoding: "binary"}, function(err, contents) {
        if(err) {
            return console.error(err);
        }
        var message = {
            messageType: parseInt(path.basename(options.replay.filename, ".bin")),
            decrypted: contents
        };

        definitions.decode(message);
        if(message.decoded) {
            jsome(message.decoded);
        }
    });
} else {
    var server = net.createServer();

    server.on('error', function(err) {
        if (err.code == 'EADDRINUSE') {
            console.log('[INFO] Address in use, exiting...'.red);
        } else {
            console.log(('[INFO] Unknown error setting up proxy: ' + err).error);
        }

        process.exit(1);
    });

    server.on('listening', function() {
        console.log(('[INFO] Listening on ' + server.address().address + ':' + server.address().port).cyan);
    });

    server.on('connection', function(socket) {
        var gameserver = new net.Socket();
        socket.key = socket.remoteAddress + ":" + socket.remotePort;
        clients[socket.key] = socket;
		
		clients[socket.key].clientCrypto = new cryptoClass("fhsd6f86f67rt8fw78fw789we78r9789wer6re" + "nonce");
		clients[socket.key].serverCrypto = new cryptoClass("fhsd6f86f67rt8fw78fw789we78r9789wer6re" + "nonce");

        var clientPacketReceiver = new PacketReceiver();
        var serverPacketReceiver = new PacketReceiver();
		
        console.log(('[INFO] New client ' + socket.key + ' connected.').cyan);

        gameserver.connect(9339, "game.brawlstarsgame.com", function() {
            console.log(('[INFO] Connected to game server on ' + gameserver.remoteAddress + ':' + gameserver.remotePort).cyan);
        });

        gameserver.on("data", function(chunk) {
            serverPacketReceiver.packetize(chunk, function(packet) {
                var message = {
                    'messageType': packet.readUInt16BE(0,2),
                    'length': packet.readUIntBE(2, 3),
                    'version': packet.readUInt16BE(5),
                    'payload': packet.slice(7, packet.length)
                };

                console.log(('[SERVER] ' + (EMsg[message.messageType] ? EMsg[message.messageType] + ' [' + message.messageType + ']' : message.messageType)).yellow);

                message.decrypted = clients[socket.key].serverCrypto.decryptPacket(message.payload);

                if(options.dump) {
					fs.mkdir(options.dump.filename + "/" + message.messageType, function(e) { 
						fs.writeFile(options.dump.filename + "/" + message.messageType + "/" + message.messageType + ".bin", Buffer.from(message.decrypted), {encoding: "binary"}, function(err) {
							if(err) {
								return console.log(err);
							}
						});
						fs.writeFile(options.dump.filename + "/" + message.messageType + "/" + message.messageType + ".txt", Buffer.from(message.decrypted).toString('hex'), function(err) {
							if(err) {
								return console.log(err);
							}
						});							
					});
                }
                definitions.decode(message);

                if(options.verbose && message.decoded && Object.keys(message.decoded).length) {
                    jsome(message.decoded);
                }

                var header = Buffer.alloc(7);

                header.writeUInt16BE(message.messageType, 0);
                header.writeUIntBE(message.payload.length, 2, 3);
                header.writeUInt16BE(message.version, 5);

                clients[socket.key].write(Buffer.concat([header, Buffer.from(message.payload)]));
            });
        });

        gameserver.on("end", function() {
            console.log('[INFO] Disconnected from game server'.cyan);
        });

        clients[socket.key].on('data', function(chunk) {
            clientPacketReceiver.packetize(chunk, function(packet) {
                var message = {
                    'messageType': packet.readUInt16BE(0),
                    'length': packet.readUIntBE(2, 3),
                    'version': packet.readUInt16BE(5),
                    'payload': packet.slice(7, packet.length)
                };

                console.log(('[CLIENT] ' + (EMsg[message.messageType] ? EMsg[message.messageType] + ' [' + message.messageType + ']' : message.messageType)).green);

                message.decrypted = clients[socket.key].clientCrypto.decryptPacket(message.payload);

                if(options.dump) {
					fs.mkdir(options.dump.filename + "/" + message.messageType, function(e) { 
						fs.writeFile(options.dump.filename + "/" + message.messageType + "/" + message.messageType + ".bin", Buffer.from(message.decrypted), {encoding: "binary"}, function(err) {
							if(err) {
								return console.log(err);
							}
						});
						fs.writeFile(options.dump.filename + "/" + message.messageType + "/" + message.messageType + ".txt", Buffer.from(message.decrypted).toString('hex'), function(err) {
							if(err) {
								return console.log(err);
							}
						});							
					});
                }

                definitions.decode(message);

                if(options.verbose && message.decoded && Object.keys(message.decoded).length) {
                    jsome(message.decoded);
                }


                var header = Buffer.alloc(7);

                header.writeUInt16BE(message.messageType, 0);
                header.writeUIntBE(message.payload.length, 2, 3);
                header.writeUInt16BE(message.version, 5);
                gameserver.write(Buffer.concat([header, Buffer.from(message.payload)]));
            });
        });

        clients[socket.key].on('end', function() {
            console.log(('[INFO] Client ' + socket.key + ' disconnected from proxy.').cyan);
            delete clients[socket.key];
            gameserver.end();
        });
    });

    server.listen({ host: '0.0.0.0', port: 9339, exclusive: true }, function(err) {
        if (err) {
            console.log(err);
        }
    });
}
