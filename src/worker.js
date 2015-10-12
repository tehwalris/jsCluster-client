import functionToString from 'function-to-string';

function workerBody () {
  throw 'fish';
  throw 'cat';
}

export default functionToString(workerBody).body;
