import { Request, Response } from 'express';
import * as QueueHelpers from '../../helpers/queueHelpers';

export default async function handler(req: Request, res: Response) {
  const { queueName, queueHost } = req.params;
  const { Queues, Flows } = req.app.locals;
  const queue = await Queues.get(queueName, queueHost);
  const basePath = req.baseUrl;
  if (!queue)
    return res.status(404).render('dashboard/queueNotFound', {
      basePath,
      queueName,
      queueHost,
      hasFlows: Flows.hasFlows(),
    });

  let jobCounts, isPaused;
  if (queue.IS_BEE) {
    jobCounts = await queue.checkHealth();
    delete jobCounts.newestJob;
  } else if (queue.IS_BULLMQ) {
    jobCounts = await queue.getJobCounts(...QueueHelpers.BULLMQ_STATES);
  } else {
    jobCounts = await queue.getJobCounts();
  }
  const stats = await QueueHelpers.getStats(queue);

  if (!queue.IS_BEE) {
    isPaused = await QueueHelpers.isPaused(queue);
  }

  return res.render('dashboard/queueDetails', {
    basePath,
    isPaused,
    queueName,
    queueHost,
    queueIsBee: !!queue.IS_BEE,
    hasFlows: Flows.hasFlows(),
    jobCounts,
    stats,
  });
}
