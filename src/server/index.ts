import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as handlebars from 'handlebars';
import * as exphbs from 'express-handlebars';

import Queues from '../arena/queue';
import Flows from '../arena/flow';
import registerHelpers from './helpers/handlebars';
import {IArenaConfig} from '../types';

export default (config: IArenaConfig) => {
  const hbs = exphbs.create({
    defaultLayout: `${__dirname}/../../views/layout`,
    handlebars,
    partialsDir: `${__dirname}/../../views/partials/`,
    extname: 'hbs',
  });

  const app = express();

  const queues = new Queues(config);
  const flows = new Flows(config);
  registerHelpers(handlebars, {queues});

  app.locals.Queues = queues;
  app.locals.Flows = flows;
  app.locals.appBasePath = '';
  app.locals.vendorPath = '/vendor';
  app.locals.customCssPath = config.customCssPath;
  app.locals.customJsPath = config.customJsPath;

  app.set('views', `${__dirname}/../../views`);
  app.set('view engine', 'hbs');
  app.set('json spaces', 2);

  app.engine('hbs', hbs.engine);

  app.use(bodyParser.json());

  return {app, queues};
};
