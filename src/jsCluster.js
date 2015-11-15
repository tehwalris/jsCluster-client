import ClusterClient from './clusterClient';
import ClusterMonitor from './clusterMonitor';

export default {
  connect: function (...args) {return new ClusterClient(...args);},
  monitor: function (...args) {return new ClusterMonitor(...args);}
}
