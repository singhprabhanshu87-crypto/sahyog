import dns from 'node:dns';

const servers = dns.getServers();
const isLoopbackFallback =
  servers.length === 1 && (servers[0] === '127.0.0.1' || servers[0] === '::1');

if (isLoopbackFallback) {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
}
