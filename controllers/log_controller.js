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
        'message': 'Invalid `type` and/or `activity` value. Expecting (`student` or `csims`) and (`in` or `out`).'
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
    const sort = data.sort
    const filter = data.filter

    if (!sort || !filter) {
      response.write(JSON.stringify({
        'success': false,
        'result': null,
        'message': 'Invalid data. Expecting `sort`, `filter` parameters.',
      }, undefined, 4))
      return response.end()
    }

    let sortOption = ["csims-number", "student-number", "name", "timestamp"]
    let filterOption = ["all", "first-year", "second-year", "third-year", "fourth-year"]

    if (sortOption.includes(sort) && filterOption.includes(filter)) {
      const res = await log.getLogs(sort, filter)
      if (typeof(res) == "string") {
        response.write(JSON.stringify({
          'success': true,
          'result': null,
          'message': res
        }, undefined, 4))
        return response.end()  
      } else {
        response.write(JSON.stringify({
          'success': true,
          'result': res,
          'message': null
        }, undefined, 4))
        return response.end()
      }
    } else {
      response.write(JSON.stringify({
        'success': false,
        'result': null,
        'message': 'Invalid `sort` and/or `filter` value.'
      }, undefined, 4))
      return response.end()
    }
    
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

export async function deletePerTimestamp(request, response) {
  response.setHeader('Content-Type', 'application/json')
  try {
    const data = request?.body
    const studentID = data.id
    const timestamp = data.timestamp
    
    if (!studentID || !timestamp) {
      response.write(JSON.stringify({
        'success': false,
        'result': null,
        'message': 'Invalid data. Expecting `id`, `timestamp`.'
      }, undefined, 4))
      return response.end()
    }
    else {
      const res = await log.deleteLogsPerTime(studentID, timestamp)
      if (res != null) {
        response.write(JSON.stringify({
          'success': true,
          'result': res,
          'message': "Timestamp deleted successfully."
        }, undefined, 4))
        return response.end()
      } else {
        response.write(JSON.stringify({
          'success': true,
          'result': res,
          'message': "Failed to delete timestamp."
        }, undefined, 4))
        return response.end()
      }
    }
  } catch (err) {
    response.write(JSON.stringify({
      'success': false,
      'result': null,
      'message': err.message
    }, undefined, 4))
    return response.end()
  }
}

export async function deletePerStudent(request, response) {
  response.setHeader('Content-Type', 'application/json')
  try {
    const data = request?.body
    const students = data.students

    if (!students) {
      response.write(JSON.stringify({
        'success': false,
        'result': null,
        'message': 'Invalid data. Expecting `students`.'
      }, undefined, 4))
      return response.end()
    } else {
      const res = await log.deleteLogsPerStudent(students)
      if (res != null) {
        response.write(JSON.stringify({
          'success': true,
          'result': res,
          'message': null
        }, undefined, 4))
        return response.end()
      } else {
        response.write(JSON.stringify({
          'success': true,
          'result': res,
          'message': "No selected student."
        }, undefined, 4))
        return response.end()
      }
    }
  } catch (err) {
    response.write(JSON.stringify({
      'success': false,
      'result': null,
      'message': err.message
    }))
    return response.end()
  }
}

export async function logsToExcel(request, response) {
  try {
    response.setHeader('Access-Control-Expose-Headers', "Content-Disposition");
    response.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    response.setHeader("Content-Disposition", "attachment; filename=BSCS_LOGS.xlsx");
    const workbook = await log.exportLogs()
    return workbook.xlsx.write(response)
        .then(function(){
            response.end();
        });
  } catch (err) {
    response.write(JSON.stringify({
      'success': false,
      'result': null,
      'message': err.message
    }, undefined, 4))
    return response.end()
  }
}