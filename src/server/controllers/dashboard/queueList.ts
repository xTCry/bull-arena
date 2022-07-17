import {Request, Response} from 'express';

export default async function handler(req: Request, res: Response) {
  const {Queues, Flows} = req.app.locals;
  const queues = Queues.list();
  const basePath = req.baseUrl;

  return res.render('dashboard/queueList', {
    basePath,
    queues,
    hasFlows: Flows.hasFlows(),
  });
}
