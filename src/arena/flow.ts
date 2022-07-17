import * as _ from 'lodash';
import {IArenaConfig, IFlow} from '../types';

/*
  This class will be allowed only for BullMQ
*/
export default class Flows {
  public _flows: Record<string, Record<string, IFlow>> = {};
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
    return this._config.flows;
  }

  public hasFlows() {
    return this._config.flows!?.length > 0;
  }

  public setConfig(config: IArenaConfig) {
    this._config = {...config, flows: config.flows && config.flows.slice()};

    if (this.hasFlows() && !this._checkConstructors()) {
      throw new TypeError(
        'as of 1.16.0, bullmq requires that the flow connections be provided to Arena'
      );
    }
  }

  private _checkConstructors() {
    const hasBullMQ = this._config.flows!.every(
      (flow) => flow.type === 'bullmq'
    );

    return hasBullMQ && this._config.BullMQ;
  }

  public async get(connectionName: string, queueHost: string) {
    const flowConfig = _.find(this._config.flows, {
      name: connectionName,
      hostId: queueHost,
    });
    if (!flowConfig) return null;

    if (this._flows[queueHost] && this._flows[queueHost][connectionName]) {
      return this._flows[queueHost][connectionName];
    }

    const {
      type,
      port,
      host,
      db,
      password,
      username,
      prefix,
      url,
      redis,
      tls,
    } = flowConfig as any;

    const redisHost: any = {
      host,
      ...(password && {password}),
      ...(username && {username}),
      ...(port && {port}),
      ...(db && {db}),
      ...(tls && {tls}),
    };

    const isBullMQ = type === 'bullmq';

    const options: any = {
      redis: redis || url || redisHost,
      ...(prefix && {prefix}),
    };

    let flow: IFlow;
    if (isBullMQ) {
      if (flowConfig.createClient)
        options.createClient = flowConfig.createClient;

      const {FlowBullMQ} = this._config;
      const {redis, ...rest} = options;
      flow = new FlowBullMQ!({
        connection: redis,
        ...rest,
      });
      flow.IS_BULLMQ = true;
    } else {
      return null;
    }

    this._flows[queueHost] = this._flows[queueHost] || {};
    this._flows[queueHost][connectionName] = flow;

    return flow;
  }

  /**
   * Creates and adds jobs with the given data using the provided flow.
   *
   * @param {IFlow} flow A Bullmq flow class
   * @param {Object} data The data to be used within the flow
   */
  public async set(flow: IFlow, data: any) {
    const args = [data];

    return flow.add.apply(flow, args);
  }
}
