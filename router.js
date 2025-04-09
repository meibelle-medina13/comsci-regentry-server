import cors from 'cors'
import fileUpload from 'express-fileupload'

import StudentRoutes from './routes/student_routes.js'
import LogRoutes from './routes/log_routes.js'

const registerRoutes = (app) => {
  app.use(cors())
  app.use(fileUpload())
  app.use('/masterlist', StudentRoutes)
  app.use('/logs', LogRoutes)
}

export default registerRoutes