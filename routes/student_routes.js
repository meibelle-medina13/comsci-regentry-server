import express from 'express'
const router = express.Router()

import { getMasterlist, importMasterlist } from '../controllers/student_controller.js'

router.get('/', getMasterlist)
router.post('/', importMasterlist)

export default router