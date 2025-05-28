import databaseInstance from '../database/db.js'
import excelJS from 'exceljs'

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
  if (currentHour.length < 2) {
    currentHour = '0' + currentHour
  }
  if (currentMinutes.length < 2) {
    currentMinutes = '0' + currentMinutes
  }
  if (currentSeconds.length < 2) {
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

        databaseInstance.query(`SELECT student_ID, log_timestamp, activity FROM logs WHERE student_ID = ? ORDER BY log_ID DESC LIMIT 1`, [studentID],
        (err, result) => {
          if (err) reject (err)
          if (result.length != 0) {
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
        resolve("Student not found.")
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

function getLogs(sort, filter) {
  return new Promise((resolve, reject) => {
    const cleanSort = _sanitize(sort)
    const cleanFilter = _sanitize(filter)
    let sorting_param
    let filter_param
    let arrangement = "ASC"

    if (cleanSort == "timestamp") {
      sorting_param = "log_timestamp"
      arrangement = "DESC"
    } else if (cleanSort == "csims-number") {
      sorting_param = "csims_number"
    } else if (cleanSort == "student-number") {
      sorting_param = "student_number"
    } else if (cleanSort == "name") {
      sorting_param = "lastname"
    }

    let filters = ['first-year', 'second-year', 'third-year', 'fourth-year']

    if (cleanFilter != "all") {
      filter_param = filters.indexOf(cleanFilter) + 1
      databaseInstance.query(`SELECT student_ID, csims_number, student_number, lastname, firstname, middle_initial, year_level, section, log_timestamp, activity 
        FROM logs INNER JOIN students ON logs.student_ID = students.ID  WHERE year_level = ? ORDER BY ${sorting_param} ${arrangement}`, [filter_param], (err, result) => {
        if (err) reject (err)
        if (result.length > 0) {
          let data = {}
          let activity
          for (let i = 0; i < result.length; i++) {
            if (result[i].activity == 1) {
              activity = "In"
            }
            else if (result[i].activity == 0) {
              activity = "Out"
            }
            else {
              activity = null
            }
  
            if (result[i].lastname + result[i].student_ID in data) {
              let record = {
                "activity": activity,
                "timestamp": result[i].log_timestamp
              }
              data[result[i].lastname + result[i].student_ID].records.push(record)
            } else {
              let tempData = {
                "id": result[i].student_ID,
                "csims_number": result[i].csims_number,
                "student_number": result[i].student_number,
                "lastname": result[i].lastname,
                "firstname": result[i].firstname,
                "middle_initial": result[i].middle_initial,
                "year_level": result[i].year_level,
                "section": result[i].section,
                "records": [
                  { 
                    "activity": activity,
                    "timestamp": result[i].log_timestamp
                  }
                ]
              }
              data[result[i].lastname + result[i].student_ID] = tempData
            }
          }
          resolve(arrangeTimestamp(data))
        } else {
          resolve("No data fetched.")
        }
      })
    } else {
      databaseInstance.query(`SELECT student_ID, csims_number, student_number, lastname, firstname, middle_initial, year_level, section, log_timestamp, activity 
        FROM logs INNER JOIN students ON logs.student_ID = students.ID ORDER BY ${sorting_param} ${arrangement}`, (err, result) => {
        if (err) reject (err)
        if (result.length > 0) {
          let data = {}
          let activity
          for (let i = 0; i < result.length; i++) {
            if (result[i].activity == 1) {
              activity = "In"
            }
            else if (result[i].activity == 0) {
              activity = "Out"
            }
            else {
              activity = null
            }
  
            if (result[i].lastname + result[i].student_ID in data) {
              let record = {
                "activity": activity,
                "timestamp": result[i].log_timestamp
              }
              data[result[i].lastname + result[i].student_ID].records.push(record)
            }
            else {
              let tempData = {
                "id": result[i].student_ID,
                "csims_number": result[i].csims_number,
                "student_number": result[i].student_number,
                "lastname": result[i].lastname,
                "firstname": result[i].firstname,
                "middle_initial": result[i].middle_initial,
                "year_level": result[i].year_level,
                "section": result[i].section,
                "records": [
                  { 
                    "activity": activity,
                    "timestamp": result[i].log_timestamp
                  }
                ]
              }
              data[result[i].lastname + result[i].student_ID] = tempData
            }
          }
          resolve(arrangeTimestamp(data))
        } else {
          resolve("No data fetched.")
        }
      })
    }
  })
}

function arrangeTimestamp(data) {
  return new Promise((resolve, reject) => {
    if (data.length != 0) {
      let dataArray = []
      for (let key in data) {
        let records = data[key].records
        let timestampArray = []
        for (let recordKey in records) {
          timestampArray.push(records[recordKey].timestamp)
        }
        timestampArray.sort()
        let sortedRecords = []
        for (let timeIndex in timestampArray) {
          const recordIndex = records.findIndex(obj => obj['timestamp'] === timestampArray[timeIndex])
          sortedRecords.push(records[recordIndex])
        }
        data[key].records = sortedRecords
        dataArray.push(data[key])
      }
      resolve(dataArray)
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
    databaseInstance.query(`SELECT csims_number, student_number, lastname, firstname, middle_initial, year_level, section, log_timestamp, activity 
      FROM logs INNER JOIN students ON logs.student_ID = students.ID ORDER BY log_ID DESC LIMIT 5`, (err, results, fields) => {
      if (err) reject (err)
      if (results.length > 0) {
        let data = []
        for (let i = 0; i < results.length; i++) {
          if (results[i].activity == 1) {
            results[i].activity = "In"
          }
          else if (results[i].activity == 0) {
            results[i].activity = "Out"
          }
          let tempData = {
            "csims_number": results[i].csims_number,
            "student_number": results[i].student_number,
            "lastname": results[i].lastname,
            "firstname": results[i].firstname,
            "middle_initial": results[i].middle_initial,
            "year_level": results[i].year_level,
            "section": results[i].section,
            "timestamp": results[i].log_timestamp,
            "activity": results[i].activity
          }
          data.push(tempData)
        }
        resolve(data)
      }
      else {
        resolve("No data fetched.")
      }
    })
  })
}

function getLogSummary() {
  return new Promise((resolve, reject) => {
    let present = 0
    let absent = 0
    let inValue = 0
    let outValue = 0

    let summary = {
      "activity": [
        {
          "name": "IN",
          "value": 0
        },
        {
          "name": "OUT",
          "value": 0
        }
      ],
      "attendance": [
        {
          "name": "PRESENT",
          "value": 0
        },
        {
          "name": "ABSENT",
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

function deleteLogsPerTime(studentID, timestamp) {
  return new Promise((resolve, reject) => {
    databaseInstance.query(`DELETE FROM logs WHERE student_ID = ? AND log_timestamp = ?`, [studentID, timestamp], 
    (err, result) => {
      if (err) reject (err)
      console.log(result.affectedRows)
      if (result.affectedRows > 0) {
        resolve({
          "deleted_row": result.affectedRows
        })
      }
      else {
        resolve(null)
      }
    }
    )
  })
}

function deleteLogsPerStudent(students) {
  return new Promise((resolve, reject) => {
    if (students.length > 0) {
      let successful = []
      let failed = []
      for (let i = 0; i < students.length; i++) {
        console.log(students[i])
        let id = students[i]
        databaseInstance.query(`DELETE FROM logs WHERE student_ID = ?`, [id], (err, result) => {
          console.log(result)
          if (result != undefined) {
            if (result.affectedRows > 0) {
              successful.push(students[i])
            } else {
              failed.push(students[i])
            }

            if ((successful.length) + (failed.length) == students.length) {
              resolve({
                "req_to_delete": students,
                "successfully_deleted": successful,
                "failed_to_delete": failed
              })
            }
          }
        })
      }
    } else {
      resolve(null)
    }
  })
}

function exportLogs() {
  return new Promise((resolve, reject) => {
    const levels = ["First Year", "Second Year", "Third Year", "Fourth Year"]
    const workbook = new excelJS.Workbook()
    for (let i = 1; i <= 4; i++) {
      databaseInstance.query(`SELECT csims_number, student_number, lastname, firstname, middle_initial, year_level, section, log_timestamp, activity 
      FROM logs INNER JOIN students ON logs.student_ID = students.ID WHERE year_level = ? ORDER BY lastname`, [i], 
      (err, result) => {
        if (err) reject (err)
        const worksheet = workbook.addWorksheet(levels[i-1])
        worksheet.columns = [
          { header: "CSIMS Number", key: "csims", width: 15 }, 
          { header: "Student Number", key: "student_num", width: 15 },
          { header: "Last Name", key: "lastname", width: 15 },
          { header: "First Name", key: "firstname", width: 15 },
          { header: "Middle Initial", key: "middle", width: 15 },
          { header: "Year Level", key: "year_level", width: 10 },
          { header: "Section", key: "section", width: 10 },
          { header: "Timestamp", key: "timestamp", width: 15 },
          { header: "Activity", key: "activity", width: 10 }
        ]
        
        for (let j = 0; j < result.length; j++) {
          let activityValue = null
          if (result[j].activity == 1) {
            activityValue = "In"
          } else if (result[j].activity == 0) {
            activityValue = "Out"
          }

          worksheet.addRow({
            csims: parseInt(result[j].csims_number, 10),
            student_num: parseInt(result[j].student_number, 10),
            lastname: result[j].lastname,
            firstname: result[j].firstname,
            middle: result[j].middle_initial,
            year_level: result[j].year_level,
            section: result[j].section,
            timestamp: result[j].log_timestamp,
            activity: activityValue
          })
        }
        if (workbook.worksheets.length == 4) {
          const newWorkbook = new excelJS.Workbook()

          levels.forEach((year_level) => {
            const existingSheet = workbook.getWorksheet(year_level)
            const newSheet = newWorkbook.addWorksheet(year_level)

            existingSheet.eachRow((row, rowNumber) => {
              row.eachCell((cell, colNumber) => {
                newSheet.getCell(rowNumber, colNumber).value = cell.value
                if ([6, 7, 9].includes(colNumber)) {
                  newSheet.getColumn(colNumber).width = 10
                } else if ([3, 4].includes(colNumber)) {
                  newSheet.getColumn(colNumber).width = 20
                } else {
                  newSheet.getColumn(colNumber).width = 15
                }
              })
            })
          })
          resolve(newWorkbook)
        }
      })
    }
  })
}

export default {
  addLog,
  getLogs,
  getLogStatistics,
  getLogSummary,
  getRecentLogs,
  deleteLogsPerTime,
  deleteLogsPerStudent,
  exportLogs
}