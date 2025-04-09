import databaseInstance from '../database/db.js'

function _sanitize(text) {
  if (typeof text === "number") {
    return text
  }
  return text.replace(/([^a-z-A-Z-0-9 .@_'])+/g, '')
}

function addLog(csims_number, time) {
  const cleanCSIMS = _sanitize(csims_number)
  let timestamp = time
  let [currentHour, currentMinutes] = time.split(":")
  if (parseInt(currentHour, 10) < 10) {
    currentHour = '0' + currentHour
    timestamp = '0' + time
  }

  return new Promise((resolve, reject) => {
    databaseInstance.query(`SELECT ID FROM students WHERE csims_number = ?`, [cleanCSIMS], 
    (err, result) => {
      if (err) reject (err)
      if (result.length == 1) {
        const studentID = result[0].ID

        databaseInstance.query(`SELECT student_ID, log_timestamp FROM logs ORDER BY log_ID DESC LIMIT 1`,
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
                resolve(insertLog(studentID, timestamp))
              }
            }
            else {
              resolve(insertLog(studentID, timestamp))
            }
          }
          else {
            resolve(insertLog(studentID, timestamp))
          }
        })
      } else {
        resolve("Student not found.")
      }
    })
  })
}

function insertLog(studentID, timestamp) {
  return new Promise((resolve, reject) => {
    databaseInstance.query(`INSERT INTO logs (student_ID, log_timestamp) VALUES(?, ?)`,
    [studentID, timestamp], 
    (err, result) => {
      if (err) reject(err)
      resolve("Student Logged Successfully.")
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

function getLogSummary(sort) {
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
            yearLevelData["head_count"] = results.length
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

export default {
  addLog,
  getLogs,
  getLogSummary,
  getRecentLogs
}