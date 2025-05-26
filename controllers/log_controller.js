import log from '../models/log_model.js'

export async function studentLog(request, response) {
  response.setHeader('Content-Type', 'application/json')
  try {
    const data = request?.body
    const type = data.type.toLowerCase()
    const number = data.number
    const time = data.time
    const activity = data.activity.toLowerCase()

    if (!type || !number || !time || !activity) {
      response.write(JSON.stringify({
        'success': false,
        'result': null,
        'message': 'Invalid data. Expecting `type`, `number`, `timestamp`, `activity`.'
      }, undefined, 4))
      return response.end()
    }
    
    const typeOption = ["student", "csims"]
    const activityOption = ["in", "out"]
    if (typeOption.includes(type) && activityOption.includes(activity)) {
      const res = await log.addLog(type, number, time, activity)
      if (typeof(res) == "string") {
        response.write(JSON.stringify({
          'success': true,
          'result': null,
          'message': res
        }, undefined, 4))
        return response.end()
      }
      else {
       response.write(JSON.stringify({
          'success': true,
          'result': res,
          'message': null
        }, undefined, 4))
        return response.end() 
      }
    }
    else {
      response.write(JSON.stringify({
        'success': false,
        'result': null,
        'message': 'Invalid `type` and/or `activity` data. Expecting (`student` or `csims`) and (`in` or `out`).'
      }, undefined, 4))
      return response.end()
    }
  }
  catch (err) {
    response.write(JSON.stringify({
      'success': false,
      'result': null,
      'message': err.message
    }, undefined, 4))
  }
  return response.end()
}

export async function getAllLogs(request, response) {
  response.setHeader('Content-Type', 'application/json')
  try {
    const data = request?.query
    const sorting_param = data.sort
    const res = await log.getLogs(sorting_param)
    response.write(JSON.stringify({
      'success': true,
      'result': res,
      'message': null
    }, undefined, 4))
    return response.end()
  } catch (error) {
    response.write(JSON.stringify({
      'success': false,
      'result': null,
      'message': error.message
    }, undefined, 4))
    return response.end()
  }
}

export async function logStatistics(request, response) {
  response.setHeader('Content-Type', 'application/json')
  try {
    const res = await log.getLogStatistics()
    response.write(JSON.stringify({
      'success': true,
      'result': res,
      'message': null
    }, undefined, 4))
    return response.end()
  }
  catch (err) {
    response.write(JSON.stringify({
      'success': false,
      'result': null,
      'message': err.message
    }, undefined, 4))
  }
  return response.end()
}

export async function recentLogs(request, response) {
  response.setHeader('Content-Type', 'application/json')
  try {
    const res = await log.getRecentLogs()
    if (typeof(res) == "string") {
      response.write(JSON.stringify({
        'success': true,
        'result': null,
        'message': res
      }, undefined, 4))
      return response.end()
    }
    else {
      response.write(JSON.stringify({
        'success': true,
        'result': res,
        'message': null
      }, undefined, 4))
      return response.end() 
    }
  }
  catch (err) {
    response.write(JSON.stringify({
      'success': false,
      'result': null,
      'message': err.message
    }, undefined, 4))
  }
  return response.end()
}

export async function logSummary(request, response) {
  response.setHeader('Content-Type', 'application/json')
  try {
    const res = await log.getLogSummary()
    response.write(JSON.stringify({
      'success': true,
      'result': res,
      'message': null
    }, undefined, 4))
    return response.end()
  }
  catch (err) {
    response.write(JSON.stringify({
      'success': false,
      'result': null,
      'message': err.message
    }, undefined, 4))
  }
  return response.end()
}