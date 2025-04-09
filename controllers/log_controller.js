import log from '../models/log_model.js'

export async function studentLog(request, response) {
  response.setHeader('Content-Type', 'application/json')
  try {
    const data = request?.body
    const csims_number = data.csims_number
    const time = data.time

    if (!csims_number || !time) {
      response.write(JSON.stringify({
        'success': false,
        'message': 'Invalid data. Expecting `csims`, `timestamp`.'
      }))
      return response.end()
    }

    const res = await log.addLog(csims_number, time)
    response.write(JSON.stringify({
      'success': true,
      'message': res
    }))
  }
  catch (err) {
    response.write(JSON.stringify({
      'success': false,
      'message': err.message
    }))
  }
  return response.end()
}

export async function getAllLogs(request, response) {
  response.setHeader('Content-Type', 'application/json')
  try {
    const data = request?.query
    const sorting_param = data.sort
    const res = await log.getLogs(sorting_param)
    response.write(JSON.stringify(res))
    return response.end()
  } catch (error) {
    response.write(JSON.stringify({
      'success': false,
      'message': error.message
    }))
    return response.end()
  }
}

export async function logSummary(request, response) {
  response.setHeader('Content-Type', 'application/json')
  try {
    const res = await log.getLogSummary()
    response.write(JSON.stringify(res))
  }
  catch (err) {
    response.write(JSON.stringify({
      'success': false,
      'message': err.message
    }))
  }
  return response.end()
}

export async function recentLogs(request, response) {
  response.setHeader('Content-Type', 'application/json')
  try {
    const res = await log.getRecentLogs()
    response.write(JSON.stringify(res))
  }
  catch (err) {
    response.write(JSON.stringify({
      'success': false,
      'message': err.message
    }))
  }
  return response.end()
}