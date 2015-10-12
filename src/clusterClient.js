import io from 'socket.io-client';
import uuid4 from 'uuid4';
import workerString from './worker';

var workerScriptURL = URL.createObjectURL(new Blob([workerString], {type: 'text/javascript'}));

class ClusterClient {
  constructor (url, socketOptions) {
    this.uuid = uuid4();
    this._configureSocket(url, socketOptions);
    this.ready = this._connect();
  }

  run (task, input) {
    return new Promise((resolve, reject) => {
      setTimeout(reject.bind(this, 'Cluster coordinator timed out.'), 60000);
      this._socket.emit('startTask', {task: task, input: input}, (command, data) => {
        if(command == 'resolve')
          resolve(data);
        else
          reject(data);
      });
    });
  }

  _configureSocket (url, socketOptions) {
    this._socket = io(url, socketOptions);
    this._socket.on('newWorkUnit', this._handleNewWorkUnit.bind(this)); 
  }

  _connect () {
    this._socket.emit('registerClient', {uuid: this.uuid});
    return this._getTaskDefinitions()
    .then((taskDefinitions) => this.taskDefinitions = taskDefinitions)
    .then(() => new Promise((resolve) => resolve(true)));
  }

  _getTaskDefinitions () {
    return new Promise((resolve) => {
      this._socket.emit('getTaskDefinitions', resolve);
    });
  }

  _handleNewWorkUnit (workUnit, cb) {
    try {
      var workFunction = this.taskDefinitions[workUnit.task].functions.work;
      workFunction = Function.apply({}, workFunction.params.concat([workFunction.body]));
    } catch (e) {cb({type: 'error', origin: 'client', body: e});}
    try {
      cb({type: 'success', body: workFunction(workUnit)});
    } catch (e) {cb({type: 'error', origin: 'workFunction', body: e});}
    var worker = new Worker(workerScriptURL);
  }
}

export default ClusterClient;
