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
      this._socket.emit('getTaskDefinitions', (taskDefinitions) => {
        _.forEach(taskDefinitions, (taskDefinition) => {
          var workFunction = taskDefinition.functions.work;
          workFunction = Function.apply({}, workFunction.params.concat([workFunction.body]));
          taskDefinition.functions.workCompiled = workFunction;
        });
        resolve(taskDefinitions);
      });
    });
  }

  _handleNewWorkUnit (workUnit, cb) {
    var times = {};
    times.start = performance.now();
    try {
      var result = this.taskDefinitions[workUnit.task].functions.workCompiled(workUnit);
      times.end = performance.now();
      cb({type: 'success', body: result/*, times: times*/});
    } catch (e) {cb({type: 'error', origin: 'workFunction', body: e});}
  }
}

export default ClusterClient;
