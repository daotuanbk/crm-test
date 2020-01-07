conn = new Mongo();
db = conn.getDB('techkids-edu-crm-test');
db.dropDatabase();