import { Request, Response } from 'express';
import * as QueueHelpers from '../../helpers/queueHelpers';

export default async function handler(req: Request, res: Response) {
  const { connectionName, flowHost } = req.params;
  const { Flows } = req.app.locals;
  const flow = await Flows.get(connectionName, flowHost);
  const basePath = req.baseUrl;
  if (!flow)
    return res.status(404).render('dashboard/flowNotFound', {
      basePath,
      connectionName,
      flowHost,
    });

  const stats = await QueueHelpers.getStats(flow);

  return res.render('dashboard/flowDetails', {
    basePath,
    connectionName,
    flowHost,
    stats,
  });
}
