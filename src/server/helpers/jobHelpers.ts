export const getKeyProperties = (jobData: string) => {
  if (!jobData) return '';
  const [, queueName, id] = jobData.split(':');

  return {id, queueName};
};
