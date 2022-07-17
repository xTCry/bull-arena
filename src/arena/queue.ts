import * as _ from 'lodash';
import {IArenaConfig, IQueue} from '../types';

export default class Queues {
  public _queues: Record<string, Record<string, IQueue>> = {};
  public _config!: IArenaConfig;

  public useCdn = {
    value: true,
    get useCdn() {
      return this.value;
    },
    set useCdn(newValue) {
      this.value = newValue;
    },
  };

  constructor(config: IArenaConfig) {
    this.setConfig(config);
  }

  public list() {
    return this._config.queues;
  }

  public setConfig(config: IArenaConfig) {
    this._config = {...config, queues: config.queues.slice()};

    if (!this._config.queues.length) {
      throw new Error('unsupported configuration: no queues configured');
    }

    if (!this._checkConstructors()) {
      throw new TypeError(
        'as of 3.0.0, bull-arena requires that the queue constructors be provided to Arena'
      );
    }
  }

  private _checkConstructors() {
    let hasBull = false;
    let hasBee = false;
    let hasBullMQ = false;

    for (const queue of this._config.queues) {
      if (queue.type === 'bee') hasBee = true;
      else if (queue.type === 'bullmq') hasBullMQ = true;
      else hasBull = true;

      if (hasBull && hasBee && hasBullMQ) break;
    }

    return (
      (hasBull || hasBee || hasBullMQ) &&
      (!hasBull || !!this._config.Bull) &&
      (!hasBee || !!this._config.Bee) &&
      (!hasBullMQ || !!this._config.BullMQ)
    );
  }

  public async get(queueName: string, queueHost: string) {
    const queueConfig = _.find(this._config.queues, {
      name: queueName,
      hostId: queueHost,
    });
    if (!queueConfig) return null;

    if (this._queues[queueHost] && this._queues[queueHost][queueName]) {
      return this._queues[queueHost][queueName];
    }

    const {
      type,
      name,
      port,
      host,
      db,
      password,
      username,
      prefix,
      url,
      redis,
      tls,
    } = queueConfig as any;

    const redisHost: any = {
      host,
      ...(password && {password}),
      ...(username && {username}),
      ...(port && {port}),
      ...(db && {db}),
      ...(tls && {tls}),
    };

    const isBee = type === 'bee';
    const isBullMQ = type === 'bullmq';

    const options: any = {
      redis: redis || url || redisHost,
      ...(prefix && {prefix}),
    };

    let queue: IQueue;
    if (isBee) {
      _.extend(options, {
        isWorker: false,
        getEvents: false,
        sendEvents: false,
        storeJobs: false,
      });

      const {Bee} = this._config;
      queue = new Bee!(name, options);
      queue.IS_BEE = true;
    } else if (isBullMQ) {
      if (queueConfig.createClient)
        options.createClient = queueConfig.createClient;

      const {BullMQ} = this._config;
      const {redis, ...rest} = options;
      queue = new BullMQ!(name, {
        connection: redis,
        ...rest,
      });
      queue.IS_BULLMQ = true;
    } else {
      if (queueConfig.createClient)
        options.createClient = queueConfig.createClient;

      if (typeof options.redis === 'string') delete options.redis;

      const {Bull} = this._config;
      if (url) {
        queue = new Bull!(name, url, options);
      } else {
        queue = new Bull!(name, options);
      }
      queue.IS_BULL = true;
    }

    this._queues[queueHost] = this._queues[queueHost] || {};
    this._queues[queueHost][queueName] = queue;

    return queue;
  }

  /**
   * Creates and adds a job with the given `data` to the given `queue`.
   *
   * @param {IQueue} queue A bee or bull queue class
   * @param {Object} data The data to be used within the job
   * @param {String} name The name of the Bull job (optional)
   */
  public async set(queue: IQueue, data: any, name: string) {
    if (queue.IS_BEE && 'createJob' in queue) {
      return queue.createJob(data).save();
    }

    const args: any[] = [
      data,
      {
        removeOnComplete: false,
        removeOnFail: false,
      },
    ];
    if (name) args.unshift(name);

    return queue.add.apply(queue, args);
  }
}
