import {Request, Response} from 'express';

export default async function handler(req: Request, res: Response) {
  const {queueName, queueHost} = req.params;

  const {Queues} = req.app.locals;

  const queue = await Queues.get(queueName, queueHost);
  if (!queue) return res.status(404).json({error: 'queue not found'});

  try {
    await queue.resume();
  } catch (err: any) {
    return res.status(500).json({error: err.message});
  }
  return res.sendStatus(200);
}
