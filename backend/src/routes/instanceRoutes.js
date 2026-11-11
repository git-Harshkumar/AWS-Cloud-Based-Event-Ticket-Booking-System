import { Router } from 'express'
import * as instanceController from '../controllers/instanceController.js'

const router = Router()

router.get('/health', instanceController.getHealth)
router.get('/instance', instanceController.getInstanceInfo)

export default router