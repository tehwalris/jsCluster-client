import ClusterClient from './clusterClient';

export default function (...args) {
  return new ClusterClient(...args);
}
