const PostgresUtil = require('../utils/PostgresUtil')
const Likes = require('./likes.js')

async function createMessageTable() {
  // Call the function from the likes.js to create a likes table
  // NOTE: For some reason I had to comment this out so the message table would get created
  await Likes.createLikesTable()
  
  return await PostgresUtil.pool.query(`CREATE TABLE messages (
    id          SERIAL PRIMARY KEY,
    created_at  TIMESTAMP DEFAULT NOW(),
    created_by  VARCHAR(200) REFERENCES app_users(handle),
    data        JSONB
  )`)
}

async function createMessage(handle, data) {
  try {
    const result = await PostgresUtil.pool.query(
      'INSERT INTO messages (created_by, data) VALUES ($1::text, $2::jsonb);',
      [
        handle, data
      ])

    return result
  } catch (exception) {
    if (exception.code === '42P01') {
      // 42P01 - table is missing - we'll create it and try again
      await createMessageTable()
      return createMessage(handle, data)
    } else {
      // unrecognized, throw error to caller
      console.error(exception)
      throw exception
    }
  }
}

async function getMessages() {
  try {
    const result = await PostgresUtil.pool.query(
      // Provided sql
      // Note: like_query had to be used instead
      `SELECT * FROM messages 
      LEFT JOIN (
        SELECT message_id, COUNT(*) AS like_count FROM likes GROUP BY message_id
      ) like_query 
      ON messages.id = like_query.message_id`)

    return result.rows
  } catch (exception) {
    if (exception.code === '42P01') {
      // 42P01 - table is missing - we'll create it and try again
      await createMessageTable()
      return getMessages()
    } else {
      // unrecognized, throw error to caller
      console.error(exception)
      throw exception
    }
  }
}

module.exports = {
  createMessage: createMessage,
  getMessages: getMessages,
}
