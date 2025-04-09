import databaseInstance from '../database/db.js'

function _sanitize(text) {
  if (typeof text === "number") {
    return text
  }
  return text.replace(/([^a-z-A-Z-0-9 -.@_'])+/g, '')
}

function get(filter, sort) {
  const cleanFilter = _sanitize(filter)
  const cleanSort = _sanitize(sort)
  return new Promise((resolve, reject) => {
    let sorting_param;
    if (cleanSort == 'student-number') {
      sorting_param = 'student_number'
    } else {
      sorting_param = 'lastname'
    }
    let filters = ['first-year', 'second-year', 'third-year', 'fourth-year']
    if (cleanFilter != 'all') {
      let year = filters.indexOf(cleanFilter) + 1
      databaseInstance.query(`SELECT csims_number, student_number, lastname, firstname, middle_initial, year_level, section 
        FROM students WHERE year_level = ? ORDER BY ${sorting_param} ASC`, [year], (err, results, fields) => {
        if (err) reject (err)
        resolve(results)
      })
    } else {
      databaseInstance.query(`SELECT csims_number, student_number, lastname, firstname, middle_initial, year_level, section 
        FROM students ORDER BY year_level ASC, ${sorting_param} ASC`, (err, results, fields) => {
        if (err) reject (err)
        resolve(results)
      })
    }
  })
}

function importCSV(csv_data) {
  return new Promise((resolve, reject) =>  {
    databaseInstance.query(`TRUNCATE TABLE logs`, (err, result) => {
      if (err) reject (err)
      databaseInstance.query(`SET foreign_key_checks = 0`, (err, result) => {
        if (err) reject (err)
        databaseInstance.query(`TRUNCATE TABLE students`, (err, result, fields) => {
          if (err) reject (err)
          let counter = 1;

          while (counter < csv_data.length) {
            const field_data = csv_data[counter].replace(/\r/g, '').split(',')
            if (field_data.length > 1) {
              addStudent(field_data)
            }
            counter++;
          }

          databaseInstance.query(`SET foreign_key_checks = 1`, (err, result) => {
            if (err) reject (err) 
          })
          resolve()
        })
      })
    })
  })
}

function addStudent(field_data) {
  databaseInstance.query(
    `INSERT INTO students(csims_number,
      student_number,
      lastname,
      firstname,
      middle_initial,
      year_level,
      section) VALUE(?, ?, ?, ?, ?, ?, ?)`,
    [field_data[0], field_data[1].replace(/(-)/g, ''), field_data[2],
    field_data[3], field_data[4], field_data[5], field_data[6]], (err, result, fields) => {
  })
}

export default {
    get,
    importCSV
}