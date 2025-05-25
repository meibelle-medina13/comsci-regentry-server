import databaseInstance from '../database/db.js'

function _sanitize(text) {
  if (typeof text === "number") {
    return text
  }
  return text.replace(/([^a-z-A-Z-0-9 .@_'])+/g, '')
}

function addLog(type, number, time, activity) {
  const cleanType = _sanitize(type)
  const cleanNumber = _sanitize(number)
  const cleanActivity = _sanitize(activity)
  let timestamp = time

  let [currentHour, currentMinutes, currentSeconds] = time.split(":")
  if (parseInt(currentHour, 10) < 10) {
    currentHour = '0' + currentHour
  }
  if (parseInt(currentMinutes, 10) < 10) {
    currentMinutes = '0' + currentMinutes
  }
  if (parseInt(currentSeconds, 10) < 10) {
    currentSeconds = '0' + currentSeconds
  }

  timestamp = `${currentHour}:${currentMinutes}:${currentSeconds}`

  let activityValue
  if (cleanActivity == "in") {
    activityValue = 1
  }
  else {
    activityValue = 0
  }
  
  const numberType = cleanType + "_number"
  return new Promise((resolve, reject) => {
    databaseInstance.query(`SELECT ID, lastname, firstname, middle_initial FROM students WHERE ${numberType} = ?`, [cleanNumber], 
    (err, result) => {
      if (err) reject (err)
      if (result.length == 1) {
        const studentID = result[0].ID
        const lastname = result[0].lastname
        const firstname = result[0].firstname
        const middle = result[0].middle_initial

        databaseInstance.query(`SELECT student_ID, log_timestamp, activity FROM logs ORDER BY log_ID DESC LIMIT 1`,
        (err, result) => {
          if (err) reject (err)
          if (result.length != 0 && result[0].student_ID == studentID) {
            const [loggedHours, loggedMinutes] = result[0].log_timestamp.split(":")

            if (loggedHours == currentHour) {
              const timeDifference = currentMinutes - loggedMinutes;
              if (timeDifference == 0) {
                resolve("Just recently scanned, please try again after a minute.")
              }
              else {
                if (activityValue != result[0].activity) {
                  resolve(insertLog(studentID, lastname, firstname, middle, timestamp, activityValue))
                }
                else {
                  resolve(`You are currently ${cleanActivity}.`)
                }
              }
            }
            else {
              if (activityValue != result[0].activity) {
                resolve(insertLog(studentID, lastname, firstname, middle, timestamp, activityValue))
              }
              else {
                resolve(`You are currently ${cleanActivity}.`)
              }
            }
          }
          else {
            if (activityValue != 1) {
              resolve(`Newly logged students are not eligible to logout. Please login first.`)
            }
            else {
              resolve(insertLog(studentID, lastname, firstname, middle, timestamp, activityValue))
            }
          }
        })
      } else {
        resolve(null)
      }
    })
  })
}

function insertLog(studentID, lastname, firstname, middle, timestamp, activity) {
  return new Promise((resolve, reject) => {
    databaseInstance.query(`INSERT INTO logs (student_ID, log_timestamp, activity) VALUES(?, ?, ?)`,
    [studentID, timestamp, activity], 
    (err, result) => {
      if (err) reject(err)
      resolve([{
        "lastname": lastname,
        "firstname": firstname,
        "middle_initial": middle
      }])
      }
    )
  })
}

function getLogs(sort) {
  return new Promise((resolve, reject) => {
    if (sort) {
      const cleanSort = _sanitize(sort)
      let sorting_param

      if (cleanSort == "timestamp") {
        sorting_param = "log_timestamp"
      } else if (cleanSort == "csims-number") {
        sorting_param = "csims_number"
      }

      databaseInstance.query(`SELECT csims_number, student_number, lastname, firstname, middle_initial, year_level, section, log_timestamp 
        FROM logs INNER JOIN students ON logs.student_ID = students.ID ORDER BY ${sorting_param}`, (err, results, fields) => {
        if (err) reject (err)
        resolve(results)
      })
    } else {
      databaseInstance.query(`SELECT csims_number, student_number, lastname, firstname, middle_initial, year_level, section, log_timestamp 
        FROM logs INNER JOIN students ON logs.student_ID = students.ID ORDER BY log_ID`, (err, results, fields) => {
        if (err) reject (err)
        resolve(results)
      })
    }
  })
}

function getLogStatistics() {
  return new Promise((resolve, reject) => {
    let data = []
    for (let i = 0; i < 4; i++) {
      let levelName
      const levelOrder = ["First Year", "Second Year", "Third Year", "Fourth Year"]
      levelName = levelOrder[i]

      databaseInstance.query(`SELECT COUNT(year_level) FROM students WHERE year_level = ?`, [i+1], 
      (err, results, fields) => {
        if (err) reject (err)
        if (results.length > 0) {
          let yearLevelData = {
            "year_level": levelName,
            "population": results[0]['COUNT(year_level)']
          }
  
          databaseInstance.query(`SELECT COUNT(csims_number) FROM logs INNER JOIN students 
          ON logs.student_ID = students.ID WHERE year_level = ? GROUP by csims_number`, [i+1], 
          (err, results, fields) => {
            if (err) reject (err)
            let inValue = 0
            let outValue = 0
            for (let i = 0; i < results.length; i++) {
              if (results[i]['COUNT(csims_number)'] % 2 == 0) {
                outValue += 1
              }
              else {
                inValue += 1
              }
            }
            yearLevelData["present"] = results.length
            yearLevelData["in"] = inValue
            yearLevelData["out"] = outValue
            data.push(yearLevelData)

            if (data.length == 4) {
              data.sort((a, b) => levelOrder.indexOf(a.year_level) - levelOrder.indexOf(b.year_level))
              resolve(data)
            }
          })
        }
      })
    }
  })
}

function getRecentLogs() {
  return new Promise((resolve, reject) => {
    databaseInstance.query(`SELECT csims_number, student_number, lastname, firstname, middle_initial, year_level, section, log_timestamp 
      FROM logs INNER JOIN students ON logs.student_ID = students.ID ORDER BY log_ID DESC LIMIT 5`, (err, results, fields) => {
      if (err) reject (err)
      if (results.length > 0) {
        resolve(results)
      }
    })
  })
}

function getLogSummary(sort) {
  return new Promise((resolve, reject) => {
    let present = 0
    let absent = 0
    let inValue = 0
    let outValue = 0

    let summary = {
      "activity": [
        {
          "name": "in",
          "value": 0
        },
        {
          "name": "out",
          "value": 0
        }
      ],
      "attendance": [
        {
          "name": "present",
          "value": 0
        },
        {
          "name": "absent",
          "value": 0
        }
      ]
    }

    databaseInstance.query(`SELECT COUNT(student_ID) FROM logs GROUP BY student_ID`, (err, result) => {
      if (err) reject (err)
        present = result.length
        databaseInstance.query(`SELECT csims_number FROM students`, (err, result) => {
          if (err) reject (err)
          absent = result.length - present

          databaseInstance.query(`SELECT COUNT(student_ID) FROM logs GROUP BY student_ID`, (err, result) => {
            if (err) reject (err)
            for (let i = 0; i < result.length; i++) {
              if (result[i]['COUNT(student_ID)'] % 2 == 0) {
                outValue += 1
              }
              else {
                inValue += 1
              }
            }
            summary['activity'][0]['value'] = inValue
            summary['activity'][1]['value'] = outValue
            summary['attendance'][0]['value'] = present
            summary['attendance'][1]['value'] = absent
            resolve([summary])
          })
        })
    })
  })
}

export default {
  addLog,
  getLogs,
  getLogStatistics,
  getLogSummary,
  getRecentLogs
}