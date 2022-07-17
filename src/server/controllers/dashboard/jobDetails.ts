import { Request, Response } from 'express';
import * as _ from 'lodash';
import * as JobHelpers from '../../helpers/jobHelpers';

export default async function handler(req: Request, res: Response) {
  const { queueName, queueHost, id } = req.params;
  const { json } = req.query;
  const basePath = req.baseUrl;

  const { Queues, Flows } = req.app.locals;
  const queue = await Queues.get(queueName, queueHost);
  if (!queue)
    return res.status(404).render('dashboard/queueNotFound', {
      basePath,
      queueName,
      queueHost,
    });

  const job = await queue.getJob(id);
  if (!job)
    return res.status(404).render('dashboard/jobNotFound', {
      basePath,
      id,
      queueName,
      queueHost,
      hasFlows: Flows.hasFlows(),
    });

  if (json === 'true') {
    // Omit these private and non-stringifyable properties to avoid circular
    // references parsing errors.
    return res.json(_.omit(job, 'domain', 'queue', '_events', '_eventsCount'));
  }

  const jobState = queue.IS_BEE ? job.status : await job.getState();
  job.showRetryButton = !queue.IS_BEE || jobState === 'failed';
  job.retryButtonText = jobState === 'failed' ? 'Retry' : 'Trigger';
  job.showPromoteButton = !queue.IS_BEE && jobState === 'delayed';
  const stacktraces = queue.IS_BEE ? job.options.stacktraces : job.stacktrace;

  if (!queue.IS_BEE) {
    const logs = await queue.getJobLogs(job.id);
    job.logs = logs.logs || 'No Logs';
  }

  if (queue.IS_BULLMQ) {
    job.parent = JobHelpers.getKeyProperties(job.parentKey);
    const processedCursor =
      parseInt(req.query.processedCursor as string, 10) || 0;
    const processedCount =
      parseInt(req.query.processedCount as string, 10) || 25;
    const unprocessedCursor =
      parseInt(req.query.unprocessedCursor as string, 10) || 0;
    const unprocessedCount =
      parseInt(req.query.unprocessedCount as string, 10) || 25;
    job.processedCount = processedCount;
    job.unprocessedCount = unprocessedCount;

    const {
      processed,
      unprocessed,
      nextProcessedCursor,
      nextUnprocessedCursor,
    } = await job.getDependencies({
      processed: {
        cursor: processedCursor,
        count: processedCount,
      },
      unprocessed: {
        cursor: unprocessedCursor,
        count: unprocessedCount,
      },
    });
    const count = await job.getDependenciesCount();
    job.countDependencies = count;

    job.processedCursor = nextProcessedCursor;
    job.unprocessedCursor = nextUnprocessedCursor;
    if (unprocessed && unprocessed.length) {
      job.unprocessedChildren = unprocessed.map((child: any) => {
        return JobHelpers.getKeyProperties(child);
      });
    }

    if (processed) {
      const childrenKeys = Object.keys(processed);
      job.processedChildren = childrenKeys.map((child) => {
        return JobHelpers.getKeyProperties(child);
      });
    }
  }

  return res.render('dashboard/jobDetails', {
    basePath,
    queueName,
    queueHost,
    jobState,
    job,
    stacktraces,
    hasFlows: Flows.hasFlows(),
  });
}
