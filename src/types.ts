// import type { RedisClientOptions } from 'redis';
// import type { Redis } from 'ioredis';
// import type { Queue as BullQueue } from 'bull';
// import type BeeQueue from 'bee-queue';
// import type { Queue as BullMQQueue, FlowProducer } from 'bullmq';

type Redis = any;
type RedisClientOptions = any;

type BeeQueue = any;
type BullQueue = any;
type BullMQQueue = any;
type FlowProducer = any;

export type IArenaConfig = {
  /** The base path of the application. */
  appBasePath?: string;
  /** The path to the custom CSS file. */
  customCssPath?: string;
  /** The path to the custom JS file. */
  customJsPath?: string;

  queues: QueueConfigType[];
  flows?: FlowConfigType[];
  defaultRedis?: ConnectionOptions;

  Bull?: QueueCtr;
  Bee?: QueueCtr;
  BullMQ?: QueueCtr;
  FlowBullMQ?: FlowCtr;
} & ({ Bull: QueueCtr } | { Bee: QueueCtr } | { BullMQ: QueueCtr });

export interface IListenOptions {
  port?: number;
  host?: string;
  useCdn?: boolean | any;
  basePath?: string;
  disableListen?: boolean;
}

export interface QueueCtr {
  new (queueName: string, options?: any): IQueue;
  new (queueName: string, url: string, options?: any): IQueue;
}

export interface FlowCtr {
  new (options?: any, Connection?: any): IFlow;
}

export type IQueue = {
  IS_BEE?: boolean;
  IS_BULL?: boolean;
  IS_BULLMQ?: boolean;
} & Queues;

type Queues =
  | (BeeQueue & { IS_BEE: true })
  | (BullQueue & { IS_BULL: true })
  | (BullMQQueue & { IS_BULLMQ: true });

export type QueueConfigType = {
  name: string;
  hostId: string;
  type?: 'bee' | 'bull' | 'bullmq';
  prefix?: string;
  createClient?: (options: RedisClientOptions) => Redis;
} & Partial<ConnectionOptions>;

export type FlowConfigType = {
  name: string;
  hostId: string;
  type?: 'bullmq';
  prefix?: string;
  createClient?: (options: RedisClientOptions) => Redis;
} & Partial<ConnectionOptions>;

export type IFlow = {
  IS_BULLMQ?: boolean;
} & Flows;

type Flows = FlowProducer & { IS_BULLMQ: true };

type ConnectionOptions =
  | RedisPortHostConnectionOptions
  | RedisUrlConnectionOptions
  | RedisClientConnectionOptions;

interface RedisPortHostConnectionOptions {
  host: string;
  port?: number;
  password?: string;
  username?: string;
  tls?: string;
  db?: string | number;
  [key: string]: any;
}

interface RedisUrlConnectionOptions {
  url: string;
}

interface RedisClientConnectionOptions {
  redis: RedisClientOptions | Redis;
}
