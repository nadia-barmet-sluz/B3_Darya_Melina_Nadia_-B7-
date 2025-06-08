const GROUP_NAME = "b7";
const PASSWORD = "snpgq0fq8amafv92";

const SERVER_URL = "https://ict-290.herokuapp.com/sql";
const databaseClient = {
  executeSqlQuery: async (sql) => {
    const payload = { group: GROUP_NAME, pw: PASSWORD, sql };
    try {
      const response = await fetch(SERVER_URL, {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify(payload),
      });
      return await response.json();
    } catch (error) {
      console.error("Datenbankfehler:", error);
    }
  },
  insertInto: async (table, data) => {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const sql = `INSERT INTO ${table} (${keys.join(",")}) VALUES ('${values.join("','")}')`;
    return await databaseClient.executeSqlQuery(sql);
  }
};
