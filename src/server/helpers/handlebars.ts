import * as crypto from 'crypto';
import * as _ from 'lodash';
import * as handlebars from 'handlebars';
import * as moment from 'moment';
import Queues from '../../arena/queue';

const replacer = (key: any, value: any) => {
  if (_.isObject(value)) {
    return _.transform(value, (result: any, v: any, k: any) => {
      result[handlebars.Utils.escapeExpression(k)] = v;
    });
  } else if (_.isString(value)) {
    return handlebars.Utils.escapeExpression(value);
  } else {
    return value;
  }
};

// For jobs that don't have a valid ID, produce a random ID we can use in its place.
const idMapping = new WeakMap();

const getTimestamp = (job: any) => {
  // Bull
  if (job.timestamp) {
    return job.timestamp;
  }

  // Bee
  if (job.options && job.options.timestamp) {
    return job.options.timestamp;
  }
};

const helpers = {
  json(obj: any, pretty = false) {
    const args = [obj, replacer];
    if (pretty) {
      args.push(2);
    }
    // @ts-ignore
    return new handlebars.SafeString(JSON.stringify(...args));
  },

  isNumber(operand: any) {
    return parseInt(operand, 10).toString() === String(operand);
  },

  adjustedPage(currentPage: number, pageSize: number, newPageSize: number) {
    const firstId = (currentPage - 1) * pageSize;
    return _.ceil(firstId / newPageSize) + 1;
  },

  block(name: string) {
    // @ts-ignore
    const blocks = this._blocks;
    const content = blocks && blocks[name];
    return content ? content.join('\n') : null;
  },

  contentFor(name: string, options: { fn: Function }) {
    // @ts-ignore
    const blocks = this._blocks || (this._blocks = {});
    const block = blocks[name] || (blocks[name] = []);
    block.push(options.fn(this));
  },

  hashIdAttr(obj: any) {
    const { id } = obj;
    if (typeof id === 'string') {
      return crypto.createHash('sha256').update(id).digest('hex');
    }
    let mapping = idMapping.get(obj);
    if (!mapping) {
      mapping = crypto.randomBytes(32).toString('hex');
      idMapping.set(obj, mapping);
    }
    return mapping;
  },

  getDelayedExectionAt(job: any) {
    // Bull
    if (job.delay) {
      return job.delay + getTimestamp(job);
    }

    // Bee
    if (job.options && job.options.delay) {
      return job.options.delay;
    }

    // BullMQ
    if (job.opts && job.opts.delay) {
      return job.opts.delay + getTimestamp(job);
    }
  },

  getTimestamp,

  encodeURI(url: string) {
    if (typeof url !== 'string') {
      return '';
    }
    return encodeURIComponent(url);
  },

  capitalize(value: string) {
    if (typeof value !== 'string') {
      return '';
    }
    return value.charAt(0).toUpperCase() + value.slice(1);
  },

  add(a: number | string, b: number | string) {
    if (handlebars.helpers.isNumber(a) && handlebars.helpers.isNumber(b)) {
      // @ts-ignore
      return parseInt(a, 10) + parseInt(b, 10);
    }

    if (typeof a === 'string' && typeof b === 'string') {
      return a + b;
    }

    return '';
  },

  subtract(a: number | string, b: number | string) {
    if (!handlebars.helpers.isNumber(a)) {
      throw new TypeError('expected the first argument to be a number');
    }
    if (!handlebars.helpers.isNumber(b)) {
      throw new TypeError('expected the second argument to be a number');
    }
    // @ts-ignore
    return parseInt(a, 10) - parseInt(b, 10);
  },

  length(value: any) {
    if (typeof value === 'string' || Array.isArray(value)) {
      return value.length;
    }
    return 0;
  },

  moment(date?: moment.MomentInput, format?: string) {
    return moment(date).format(format);
  },

  eq(a: any, b: any, options: { fn: Function; inverse: Function }) {
    return a === b ? options.fn(this) : options.inverse(this);
  },
};

export default function registerHelpers(
  hbs: any,
  { queues }: { queues: Queues }
) {
  _.each(helpers, (fn: any, helper: any) => {
    hbs.registerHelper(helper, fn);
  });

  hbs.registerHelper('useCdn', () => {
    return queues.useCdn;
  });
}
