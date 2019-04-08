const PostgresUtil = require('../utils/PostgresUtil')

// Creating a likes table
async function createLikesTable() {
  return await PostgresUtil.pool.query(`CREATE TABLE likes (
    message_id  INTEGER,
    create_by  VARCHAR(200)
  )`)
}

// Add entries into the likes table
async function createLike(handle, data) {
  try {
    const result = await PostgresUtil.pool.query(
      'INSERT INTO likes (create_by, message_id) VALUES ($1, $2);',
      [
        handle, data
      ])

    return result
  } catch (exception) {
      console.log(exception)
    if (exception.code === '42P01') {
      // 42P01 - table is missing - we'll create it and try again
      await createLikesTable()
      return createLike(handle, data)
    } else {
      // unrecognized, throw error to caller
      console.error(exception)
      throw exception
    }
  }
}

// Export for use in other files
module.exports = {
  createLikesTable: createLikesTable,
  createLike: createLike
}
