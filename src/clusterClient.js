import io from 'socket.io-client';

class ClusterClient {
  constructor (url, socketOptions) {
    this._connect(url, socketOptions);
  }

  _connect (url, socketOptions) {
    this._socket = io(url, socketOptions);
  }
}

export default ClusterClient;
