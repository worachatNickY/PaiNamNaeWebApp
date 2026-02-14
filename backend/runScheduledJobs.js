/**
 * Scheduled Jobs Runner
 * 
 * สำหรับรันด้วย Cron Job / Task Scheduler
 * 
 * ตัวอย่างการตั้งค่า Cron (Linux):
 * 0 0 * * * cd /path/to/backend && node runScheduledJobs.js
 * 
 * ตัวอย่างการตั้งค่า Task Scheduler (Windows):
 * - Create Basic Task
 * - Trigger: Daily at 00:00
 * - Action: Start a program
 * - Program: node
 * - Arguments: runScheduledJobs.js
 * - Start in: D:\Software Engineer\PaiNamNae\PaiNamNaeWebApp\backend
 */

require('dotenv').config();
const { runAllJobs } = require('./src/jobs/scheduledJobs');

console.log('==========================================');
console.log('  PDPA + พ.ร.บ.คอมพิวเตอร์ฯ Scheduled Jobs');
console.log('==========================================');
console.log('');
console.log('Jobs to run:');
console.log('  1. Hard Delete Users (30 days - PDPA)');
console.log('  2. Cleanup Expired Logs (90 days - Computer Crime Act)');
console.log('');

runAllJobs()
    .then((result) => {
        console.log('');
        console.log('All jobs completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('');
        console.error('Jobs failed:', error.message);
        process.exit(1);
    });
