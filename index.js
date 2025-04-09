import express from 'express';
import bodyParser from 'body-parser';
import registerRoutes  from './router.js'

const port = 3000;

const app = express();
app.use( express.json() )
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json())
registerRoutes(app)

app.listen(port, () => {
  console.log(`[SERVER] Running on development port ${ port }`)
})