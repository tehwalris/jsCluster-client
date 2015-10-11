import io from 'socket.io-client';
import uuid4 from 'uuid4';

class ClusterClient {
  constructor (url, socketOptions) {
    this.uuid = uuid4();
    this._configureSocket(url, socketOptions);
    this.ready = this._connect();
  }

  _configureSocket (url, socketOptions) {
    this._socket = io(url, socketOptions);
    this._socket.on('newWorkUnit', this._handleNewWorkUnit.bind(this)); 
  }

  _connect () {
    this._socket.emit('registerClient', {uuid: this.uuid});
    return this._getTaskDefinitions()
    .then(() => new Promise((resolve) => resolve(true)));
  }

  _getTaskDefinitions () {
    return new Promise((resolve) => {
      this._socket.emit('getTaskDefinitions', resolve);
    });
  }

  _handleNewWorkUnit (workUnit, cb) {
    try {
      var workFunctionString = this.taskDefinitions[workUnit.task].functions.work;
      var workFunction = Function.apply({}, workFunctionString.params.concat([workFunctionString.body]));
    } catch (e) {cb({type: 'error', origin: 'client', body: e});}
    try {
      var workResult = workFunction(workUnit.data);
    } catch (e) {cb({type: 'error', origin: 'workFunction', body: e});}
    cb({type: 'sucess', body: workResult});
  }
}

export default ClusterClient;
