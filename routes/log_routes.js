import express from 'express'
const router = express.Router()

import { getAllLogs, logStatistics, logSummary, recentLogs, studentLog } from '../controllers/log_controller.js'

router.post('/', studentLog)
router.get('/', getAllLogs)
router.get('/statistics', logStatistics)
router.get('/summary', logSummary)
router.get('/most-recent', recentLogs)

export default router