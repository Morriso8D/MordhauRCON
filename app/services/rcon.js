/*!
 * node-rcon
 * Copyright(c) 2021 Alex Morris
 * Forked from Justin Li https://github.com/pushrax/node-rcon
 * MIT Licensed
 */

const EventsEmitter = require('events');
const net = require('net');
const dgram = require('dgram');
const Buffer = require('buffer').Buffer;

let instance = null;

class Rcon extends EventsEmitter{

    PacketType = {
        COMMAND: 0x02,
        AUTH: 0x03,
        RESPONSE_VALUE: 0x00,
        RESPONSE_AUTH: 0x02
    };

    constructor(host, port, password, options){
        super();
        options = options || {};
        this.host = host;
        this.port = port;
        this.password = password;
        this.rconId = options.id || 0x0012D4A6; // This is arbitrary in most cases
        this.hasAuthed = false;
        this.outstandingData = null;
        this.tcp = options.tcp == null ? true : options.tcp;
        this.challenge = options.challenge == null ? true : options.challenge;
    }

    static singleton(host, port, password, options){
        if(!instance){
            instance = new Rcon(host, port, password, options);
        }

        return instance;
    }

    send(data, cmd, id) {
        var sendBuf;
        if (this.tcp) {
          cmd = cmd || this.PacketType.COMMAND;
          id = id || this.rconId;
      
          var length = Buffer.byteLength(data);
          sendBuf = new Buffer.alloc(length + 14);
          sendBuf.writeInt32LE(length + 10, 0);
          sendBuf.writeInt32LE(id, 4);
          sendBuf.writeInt32LE(cmd, 8);
          sendBuf.write(data, 12);
          sendBuf.writeInt16LE(0, length + 12);
        } else {
          if (this.challenge && !this._challengeToken) {
            this.emit('error', new Error('Not authenticated'));
            return;
          }
          var str = "rcon ";
          if (this._challengeToken) str += this._challengeToken + " ";
          if (this.password) str += this.password + " ";
          str += data + "\n";
          sendBuf = new Buffer(4 + Buffer.byteLength(str));
          sendBuf.writeInt32LE(-1, 0);
          sendBuf.write(str, 4)
        }
        this._sendSocket(sendBuf);
    }

    _sendSocket(buf) {
        if (this._tcpSocket) {
          // console.log(buf.toString('binary'));
          this._tcpSocket.write(buf.toString('binary'), 'binary');
        } else if (this._udpSocket) {
          this._udpSocket.send(buf, 0, buf.length, this.port, this.host);
        }
    }

    connect(){
        var self = this;
      
        if (this.tcp) {
          this._tcpSocket = net.createConnection(this.port, this.host);
          this._tcpSocket.on('data', function(data) { self._tcpSocketOnData(data) })
                         .on('connect', function() { self.socketOnConnect() })
                         .on('error', function(err) { self.emit('error', err) })
                         .on('end', function() { self.socketOnEnd() });
        } else {
          this._udpSocket = dgram.createSocket("udp4");
          this._udpSocket.on('message', function(data) { self._udpSocketOnData(data) })
                         .on('listening', function() { self.socketOnConnect() })
                         .on('error', function(err) { self.emit('error', err) })
                         .on('close', function() { self.socketOnEnd() });
          this._udpSocket.bind(0);
        }
    }

    disconnect(){
        if (this._tcpSocket) this._tcpSocket.end();
        if (this._udpSocket) this._udpSocket.close();
    }

    setTimeout(timeout, callback) {
        if (!this._tcpSocket) return;
      
        var self = this;
        this._tcpSocket.setTimeout(timeout, function() {
          self._tcpSocket.end();
          if (callback) callback();
        });
    }

    _udpSocketOnData(data) {
        var a = data.readUInt32LE(0);
        if (a == 0xffffffff) {
          var str = data.toString("utf-8", 4);
          var tokens = str.split(" ");
          if (tokens.length == 3 && tokens[0] == "challenge" && tokens[1] == "rcon") {
            this._challengeToken = tokens[2].substr(0, tokens[2].length - 1).trim();
            this.hasAuthed = true;
            this.emit('auth');
          } else {
            this.emit('response', str.substr(1, str.length - 2));
          }
        } else {
          this.emit('error', new Error("Received malformed packet"));
        }
    }

    _tcpSocketOnData(data) {
        if (this.outstandingData != null) {
          data = Buffer.concat([this.outstandingData, data], this.outstandingData.length + data.length);
          this.outstandingData = null;
        }
      
        while (data.length) {
          var len = data.readInt32LE(0);
          if (!len) return;
      
          var id = data.readInt32LE(4);
          var type = data.readInt32LE(8);
      
          if (len >= 10 && data.length >= len + 4) {
            if (id) {
              if (!this.hasAuthed && type == this.PacketType.RESPONSE_AUTH) {
                this.hasAuthed = true;
                this.emit('auth');
              } else if (type == this.PacketType.RESPONSE_VALUE) {
                // Read just the body of the packet (truncate the last null byte)
                // See https://developer.valvesoftware.com/wiki/Source_RCON_Protocol for details
                var str = data.toString('utf8', 12, 12 + len - 10);
      
                if (str.charAt(str.length - 1) === '\n') {
                  // Emit the response without the newline.
                  str = str.substring(0, str.length - 1);
                }
      
                this.emit('response', str);
              }
            } else {
              this.emit('error', new Error("Authentication failed"));
            }
      
            data = data.slice(12 + len - 8);
          } else {
            // Keep a reference to the chunk if it doesn't represent a full packet
            this.outstandingData = data;
            break;
          }
        }
    }

    socketOnConnect() {
        this.emit('connect');
      
        if (this.tcp) {
          this.send(this.password, this.PacketType.AUTH);
        } else if (this.challenge) {
          var str = "challenge rcon\n";
          var sendBuf = new Buffer(str.length + 4);
          sendBuf.writeInt32LE(-1, 0);
          sendBuf.write(str, 4);
          this._sendSocket(sendBuf);
        } else {
          var sendBuf = new Buffer(5);
          sendBuf.writeInt32LE(-1, 0);
          sendBuf.writeUInt8(0, 4);
          this._sendSocket(sendBuf);
      
          this.hasAuthed = true;
          this.emit('auth');
        }
    }

    socketOnEnd() {
        this.emit('end');
        this.hasAuthed = false;
    }
}

module.exports = Rcon;