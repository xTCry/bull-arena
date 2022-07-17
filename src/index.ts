import * as path from 'path';
import * as express from 'express';

import Arena from './server';
import {IArenaConfig, IListenOptions} from './types';
import routes from './server/controllers/routes';

export function run(config: IArenaConfig, listenOptions: IListenOptions = {}) {
  const {app, queues} = Arena(config);

  queues.useCdn = listenOptions.useCdn ?? true;

  app.locals.appBasePath = listenOptions.basePath || app.locals.appBasePath;

  app.use(
    app.locals.appBasePath,
    express.static(path.join(__dirname, '../', 'public'))
  );
  app.use(app.locals.appBasePath, routes);

  const {
    port = 4567,
    // Default: listen to all network interfaces.
    host = '0.0.0.0',
    disableListen,
  } = listenOptions;
  if (!disableListen) {
    app.listen(port, host, () => {
      console.log(`Arena is running on port ${port} at host ${host}`);
    });
  }

  return {app, queues};
}

export default (config: IArenaConfig, listenOpts: IListenOptions = {}) =>
  run(config, listenOpts).app;
