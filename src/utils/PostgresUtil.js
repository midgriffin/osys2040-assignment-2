const { Pool } = require('pg')

const pool = new Pool({
  // These 2 lines are used for the online version
  connectionString: process.env.DATABASE_URL,
  ssl: true
  // These 2 lines are used for the local version
  //password: "student",
  //database: "postgres"

})

module.exports = {
  pool,
}
