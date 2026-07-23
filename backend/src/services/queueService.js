const { Queue, Worker } = require('bullmq');
const Redis = require('ioredis');
const { supabase } = require('../db');
const { notifyReorderStatusUpdate } = require('./socketService');

const QUEUE_NAME = 'supplier-reorder-queue';
let bullQueue = null;
let useBullMQ = false;

const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = process.env.REDIS_PORT || 6379;

const redisConnection = new Redis({
  host: redisHost,
  port: redisPort,
  maxRetriesPerRequest: null,
  lazyConnect: true,
  retryStrategy: () => null
});

async function initQueue() {
  try {
    await redisConnection.connect();
    console.log('⚡ Connected to Redis. Initializing BullMQ Worker Queue...');

    bullQueue = new Queue(QUEUE_NAME, {
      connection: redisConnection,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: { age: 3600 },
        removeOnFail: { age: 86400 }
      }
    });

    const worker = new Worker(
      QUEUE_NAME,
      async (job) => {
        console.log(`📦 [BullMQ Worker] Processing Job #${job.id} for Reorder ID: ${job.data.reorderId}`);
        await processSupplierReorder(job.data.reorderId);
      },
      { connection: redisConnection }
    );

    worker.on('completed', (job) => console.log(`✅ [BullMQ Worker] Job #${job.id} completed!`));

    worker.on('failed', async (job, err) => {
      console.error(`❌ [BullMQ Worker] Job #${job?.id} failed:`, err.message);
      if (job?.data?.reorderId) await handleJobFailure(job.data.reorderId, err);
    });

    useBullMQ = true;
  } catch (err) {
    console.warn(`ℹ️ Redis not available (${err.message}). Using in-memory fallback queue.`);
    useBullMQ = false;
  }
}

async function handleJobFailure(reorderId, error) {
  try {
    console.error(`🔴 Marking Reorder #${reorderId} as FAILED: ${error.message}`);
    const { data: updatedRows } = await supabase
      .from('reorder_requests')
      .update({ reorder_status: 'FAILED', updated_at: new Date().toISOString() })
      .eq('id', reorderId)
      .select();

    if (updatedRows && updatedRows[0]) notifyReorderStatusUpdate(updatedRows[0]);
  } catch (dbErr) {
    console.error(`CRITICAL: Failed to update failure status for Reorder #${reorderId}:`, dbErr.message);
  }
}

async function processSupplierReorder(reorderId) {
  try {
    // Update to PROCESSING
    const { data: processingRows } = await supabase
      .from('reorder_requests')
      .update({ reorder_status: 'PROCESSING', updated_at: new Date().toISOString() })
      .eq('id', reorderId)
      .select();

    if (processingRows && processingRows[0]) notifyReorderStatusUpdate(processingRows[0]);

    console.log(`🚚 Simulating supplier communication for Reorder #${reorderId}...`);

    // Simulate supplier API delay (3.5 seconds)
    await new Promise((resolve) => setTimeout(resolve, 3500));

    // Update to COMPLETED
    const { data: completedRows } = await supabase
      .from('reorder_requests')
      .update({ reorder_status: 'COMPLETED', updated_at: new Date().toISOString() })
      .eq('id', reorderId)
      .select();

    if (completedRows && completedRows[0]) notifyReorderStatusUpdate(completedRows[0]);

    console.log(`🎉 Supplier Reorder #${reorderId} COMPLETED.`);
    return completedRows ? completedRows[0] : null;
  } catch (err) {
    console.error(`❌ Error processing reorder #${reorderId}:`, err.message);
    await handleJobFailure(reorderId, err);
    throw err;
  }
}

async function enqueueReorderJob(reorderId) {
  if (useBullMQ && bullQueue) {
    console.log(`📥 Enqueueing Reorder #${reorderId} to BullMQ queue`);
    await bullQueue.add('process-reorder', { reorderId });
  } else {
    console.log(`📥 [Fallback] Enqueueing Reorder #${reorderId} for in-memory processing...`);
    setImmediate(async () => {
      try {
        await processSupplierReorder(reorderId);
      } catch (err) {
        console.error(`❌ [Fallback] Reorder #${reorderId} failed:`, err.message);
      }
    });
  }
}

module.exports = { initQueue, enqueueReorderJob, processSupplierReorder, handleJobFailure };
