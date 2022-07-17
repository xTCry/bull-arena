import {Request, Response} from 'express';

import * as flowHelpers from '../../helpers/flowHelpers';

export default async function handler(req: Request, res: Response) {
  const {connectionName, flowHost} = req.params;
  const {data} = req.body;

  const {Flows} = req.app.locals;

  const flow = await Flows.get(connectionName, flowHost);
  if (!flow) return res.status(404).json({error: 'flow not found'});

  try {
    const flowTree = await Flows.set(flow, data);
    const processedFlow = flowHelpers.processFlow(flowTree);

    return res.status(200).json(processedFlow);
  } catch (err: any) {
    return res.status(500).json({error: err.message});
  }
}
