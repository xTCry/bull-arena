import { Request, Response } from 'express';

export default async function handler(req: Request, res: Response) {
  const { queueName, queueHost, id } = req.params;

  const { Queues } = req.app.locals;

  const queue = await Queues.get(queueName, queueHost);
  if (!queue) return res.status(404).send({ error: 'queue not found' });

  const job = await queue.getJob(id);
  if (!job) return res.status(404).send({ error: 'job not found' });

  try {
    const jobState = queue.IS_BEE ? job.status : await job.getState();

    if (jobState === 'failed' && typeof job.retry === 'function') {
      await job.retry();
    } else {
      await Queues.set(queue, job.data, job.name);
    }

    return res.sendStatus(200);
  } catch (e: any) {
    const body = {
      error: 'queue error',
      details: e.stack,
    };
    return res.status(500).send(body);
  }
}
