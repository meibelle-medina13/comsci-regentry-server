import student from '../models/student_model.js'

export async function getMasterlist(request, response) {
  response.setHeader('Content-Type', 'application/json')
  try {
    const sort = request?.query.sort;
    const filter = request?.query.filter;
    if (!sort || !filter) {
      response.write(JSON.stringify({
        'success': false,
        'data': null,
        'message': 'Invalid data. Expecting `sort`, `filter` parameters.',
      }, undefined, 4))
      return response.end()
    }
    else {
      const res = await student.get(filter, sort)
      response.write(JSON.stringify({
        'success': true,
        'data': res,
        'message': null
      }, undefined, 4))
      return response.end()
    }
  } catch (error) {
    response.write(JSON.stringify({
      'success': false,
      'data': null,
      'message': error.message
    }, undefined, 4))
    return response.end()
  }
}

export async function importMasterlist(request, response) {
  response.setHeader('Content-Type', 'text/csv')
  if (request.files.csv_file.mimetype == 'text/csv') {
    const csv_data = request.files.csv_file.data.toString().replace(/�/g, 'ñ').split('\n')
    const csv_fields = csv_data[0].replace(/\r/g, '').split(',')
    const expected_fields = [
      'CSIMS Number',
      'Student Number', 
      'Lastname', 
      'Firstname', 
      'Middle Initial', 
      'Year Level', 
      'Section'
    ]
    if (csv_fields.toString().match(expected_fields.toString())) {
      await student.importCSV(csv_data)
      response.write(JSON.stringify({
        'success': true,
        'message': 'Importing CSV file completed.'
      }, undefined, 4))
      return response.end()
    }
    else {
      response.write(JSON.stringify({
        'success': false,
        'message': 'Invalid CSV format.',
      }, undefined, 4))
      return response.end()
    }
  } else {
    response.write(JSON.stringify({
      'success': false,
      'message': 'Invalid data. Expecting csv file.',
    }, undefined, 4))
    return response.end()
  }
}