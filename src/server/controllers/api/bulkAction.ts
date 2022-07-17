import { Request, Response } from 'express';
import * as _ from 'lodash';

export enum ActionType {
  Remove = 'remove',
  Retry = 'retry',
  Promote = 'promote',
}

const bulkAction = (action: ActionType) =>
  async function handler(req: Request, res: Response) {
    if (!_.includes(ActionType, action)) {
      res.status(401).send({
        error: 'unauthorized action',
        details: `action ${action} not permitted`,
      });
    }

    const { queueName, queueHost } = req.params;
    const { Queues } = req.app.locals;
    const queue = await Queues.get(queueName, queueHost);
    if (!queue) return res.status(404).send({ error: 'queue not found' });

    const { jobs, queueState } = req.body as {
      queueState: string;
      jobs: string[];
    };

    try {
      if (!_.isEmpty(jobs)) {
        const jobsPromises = jobs.map((id: string) =>
          queue.getJob(decodeURIComponent(id))
        );
        const fetchedJobs = await Promise.all(jobsPromises);
        const actionPromises =
          action === ActionType.Retry
            ? fetchedJobs.map((job: any) => {
                if (
                  queueState === 'failed' &&
                  typeof job.retry === 'function'
                ) {
                  return job.retry();
                } else {
                  return Queues.set(queue, job.data, job.name);
                }
              })
            : fetchedJobs.map((job) => job[action]());
        await Promise.all(actionPromises);
        return res.sendStatus(200);
      }
    } catch (e: any) {
      const body = {
        error: 'queue error',
        details: e.stack,
      };
      return res.status(500).send(body);
    }

    return res.sendStatus(200);
  };

export const bulkJobsPromote = bulkAction(ActionType.Promote);
export const bulkJobsRemove = bulkAction(ActionType.Remove);
export const bulkJobsRetry = bulkAction(ActionType.Retry);

export default bulkAction;
