import { Request, Response } from 'express';

export default async function handler(req: Request, res: Response) {
  const { queueName, queueHost } = req.params;
  const { name, data } = req.body;

  const { Queues } = req.app.locals;

  const queue = await Queues.get(queueName, queueHost);
  if (!queue) return res.status(404).json({ error: 'queue not found' });

  try {
    await Queues.set(queue, data, name);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
  return res.sendStatus(200);
}
