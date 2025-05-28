import express from 'express'
const router = express.Router()

import { getAllLogs, logStatistics, logSummary, recentLogs, studentLog, 
    deletePerTimestamp, deletePerStudent, logsToExcel } from '../controllers/log_controller.js'

router.post('/', studentLog)
router.get('/', getAllLogs)
router.get('/statistics', logStatistics)
router.get('/summary', logSummary)
router.get('/recent-logs', recentLogs)
router.get('/export', logsToExcel)
router.delete('/', deletePerTimestamp)
router.delete('/students', deletePerStudent)

export default router