type FlowType = {
  job: {
    queueName: string;
    [key: string]: any;
  };
  children?: FlowType[];
};

export const processFlow = (flow: FlowType): FlowType => {
  const {job, children} = flow;
  const {queueName} = job;

  if (children && children.length > 0) {
    return {
      job: {...job, queueName},
      children: children.map((child) => processFlow(child)),
    };
  } else {
    return {
      job: {...job, queueName},
    };
  }
};
