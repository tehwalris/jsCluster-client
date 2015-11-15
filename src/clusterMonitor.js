import io from 'socket.io-client';

class ClusterMonitor {
  constructor (url, socketOptions, handler) {
    this.handler = handler;
    this._configureSocket(url, socketOptions);
    this.ready = this._connect();
  }

  _configureSocket (url, socketOptions) {
    this._socket = io(url, socketOptions);
    this._socket.on('log', this._handleLog.bind(this)); 
  }

  _connect () {
    return this._getInitialState()
    .then(() => new Promise((resolve) => resolve(true)));
  }

  _getInitialState () {
    return new Promise((resolve) => {
      //this._socket.emit('getTaskDefinitions', resolve);
      resolve();
    });
  }

  _handleLog (type, message, data) {
    this.handler(type, message, data);
  }
}

export default ClusterMonitor;
