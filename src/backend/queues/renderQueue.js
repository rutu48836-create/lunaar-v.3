
import { Queue } from 'bullmq';
import { connection } from '../utils/redisConfig.js';

export const renderQueue = new Queue('render-jobs', { connection });

export async function countActiveJobsForUser(chat_id) {
    const jobs = await renderQueue.getJobs(['active', 'waiting']);
    return jobs.filter(job => job.data.chat_id === chat_id).length;
}