import {Router} from 'express';

import queueList from './queueList';
import queueDetails from './queueDetails';
import queueJobsByState from './queueJobsByState';
import flowList from './flowList';
import flowDetails from './flowDetails';
import jobDetails from './jobDetails';

const router = Router();

router.get('/', queueList);
router.get('/flows', flowList);
router.get('/flows/:flowHost/:connectionName', flowDetails);
router.get('/:queueHost/:queueName', queueDetails);
router.get(
  '/:queueHost/:queueName/:state(waiting|active|completed|succeeded|failed|delayed|paused|waiting-children).:ext?',
  queueJobsByState
);
router.get('/:queueHost/:queueName/:id', jobDetails);

export default router;
