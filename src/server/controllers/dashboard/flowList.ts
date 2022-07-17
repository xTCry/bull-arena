import { Request, Response } from 'express';

export default async function handler(req: Request, res: Response) {
  const { Flows } = req.app.locals;
  const flows = Flows.list();
  const basePath = req.baseUrl;

  return res.render('dashboard/flowList', { basePath, flows });
}
