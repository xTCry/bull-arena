import * as _ from 'lodash';

/**
 * Formats the number into "human readable" number/
 *
 * @param {Number} num The number to format.
 * @returns {string} The number as a string or error text if we couldn't
 *   format it.
 */
function formatBytes(num: number): string {
  if (!Number.isFinite(num)) {
    return 'Could not retrieve value';
  }

  const UNITS = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

  const neg = num < 0;
  if (neg) num = -num;

  if (num < 1) {
    return (neg ? '-' : '') + num + ' B';
  }

  const exponent = Math.min(
    Math.floor(Math.log(num) / Math.log(1024)),
    UNITS.length - 1
  );
  const numStr = Number((num / Math.pow(1024, exponent)).toPrecision(3));
  const unit = UNITS[exponent];

  return (neg ? '-' : '') + numStr + ' ' + unit;
}

function parseRedisServerInfo(redisServerInfo: string) {
  if (typeof redisServerInfo !== 'string') {
    return {};
  }

  const serverInfo: Record<string, string> = {};
  redisServerInfo
    .split('\r\n')
    .map((line) => line.trim())
    .filter((line) => !!line && !line.startsWith('#')) // remove comments and empty lines
    .forEach((line) => {
      const idx = line.indexOf(':');
      if (idx > 0) {
        serverInfo[line.substring(0, idx)] = line.substring(idx + 1);
      }
    });
  return serverInfo;
}

export const isPaused = async (queue: any) => {
  return queue.isPaused();
};

const _usefulMetrics = [
  'redis_version',
  'total_system_memory',
  'used_memory',
  'mem_fragmentation_ratio',
  'connected_clients',
  'blocked_clients',
];

export const getStats = async (queue: any) => {
  const { client } = await queue;
  const info = await client.info();

  const stats = _.pickBy(parseRedisServerInfo(info), (value, key) =>
    _.includes(_usefulMetrics, key)
  );
  stats.used_memory = formatBytes(parseInt(stats.used_memory, 10));
  stats.total_system_memory = formatBytes(
    parseInt(stats.total_system_memory, 10)
  );
  return stats;
};

/**
 * Valid states for a job in bee queue
 */
export const BEE_STATES = [
  'waiting',
  'active',
  'succeeded',
  'failed',
  'delayed',
];

/**
 * Valid states for a job in bull queue
 */
export const BULL_STATES = [
  'waiting',
  'active',
  'completed',
  'failed',
  'delayed',
  'paused',
];

/**
 * Valid states for a job in bullmq queue
 */
export const BULLMQ_STATES = [
  'waiting',
  'active',
  'completed',
  'failed',
  'delayed',
  'paused',
  'waiting-children',
];
