import { Router } from 'express';

import jobAdd from './jobAdd';
import flowAdd from './flowAdd';
import flowGet from './flowGet';
import * as bulkAction from './bulkAction';
import jobPromote from './jobPromote';
import jobRemove from './jobRemove';
import jobRetry from './jobRetry';
import queuePause from './queuePause';
import queueResume from './queueResume';

const router = Router();

router.post('/queue/:queueHost/:queueName/job', jobAdd);
router.post('/flow/:flowHost/:connectionName/flow', flowAdd);
router.get('/flow/:flowHost/:connectionName/flow', flowGet);
router.post('/queue/:queueHost/:queueName/job/bulk', bulkAction.bulkJobsRemove);
router.patch('/queue/:queueHost/:queueName/job/bulk', bulkAction.bulkJobsRetry);
router.patch(
  '/queue/:queueHost/:queueName/delayed/job/bulk',
  bulkAction.bulkJobsPromote
);
router.patch('/queue/:queueHost/:queueName/delayed/job/:id', jobPromote);
router.delete('/queue/:queueHost/:queueName/job/:id', jobRemove);
router.patch('/queue/:queueHost/:queueName/job/:id', jobRetry);
router.put('/queue/:queueHost/:queueName/pause', queuePause);
router.put('/queue/:queueHost/:queueName/resume', queueResume);

export default router;
