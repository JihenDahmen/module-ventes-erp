import mysql from "mysql2";

const db = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "200412", // fill only if you set one
    database: "erp_system"
});

db.connect((err) => {
    if (err) {
        console.error("❌ MySQL connection error:", err);
        return;
    }
    console.log("✅ Connected to MySQL (Workbench)");
});

export default db;
