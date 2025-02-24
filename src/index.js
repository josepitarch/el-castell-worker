export default {
  async fetch(request, env) {
    try {
      const formData = await request.formData();
      const file = formData.get("file");

      const lines = file.split("\n");
      await save(lines.slice(1), env.MY_DATABASE);

      return new Response("Archivo procesado correctamente", {
        headers: { "Content-Type": "text/plain" },
      });
    } catch (error) {
      return new Response(`Error: ${error.message}`, { status: 500 });
    }
  },
};

const processFile = (file) => {
  const lines = file.trim().split("\n");
  const headers = lines[0].split(";").map(header => header.trim());

  return lines.slice(1).map(line => {
    const values = line.split(";").map(value => value.trim());
    const current = {};
    
    headers.forEach((header, index) => {
      current[header] = values[index] !== undefined ? values[index] : null;
    });

    return current;
  });
}

async function save(data, db) {

  const getTime = (col) => {
    return col.split('a').map(time => time.trim())
  }

  await clearTable(db);

  for (const row of data) {
    const columns = row.split(";").filter(col => col !== "");
    const saturday = getTime(columns[6]);
    const weekday01 = getTime(columns[7]);
    const weekday02 = getTime(columns[8]);

    columns.forEach((col, index) => console.log(col));

  await db.prepare(
      `INSERT INTO schedule (area, smallholding, society, hg, fire_hydrant, saturday_sector, saturday_start_time, saturday_end_time, weekday_sector, weekday_start_time_1, weekday_end_time_1, weekday_start_time_2, weekday_end_time_2) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      columns[0], columns[1], columns[2], columns[3], columns[4], columns[5], saturday[0], saturday[1], columns[7], weekday01[0], weekday01[1], weekday02[0], weekday02[1]
    ).run();
  }
}

async function clearTable(db) {
  await db.prepare("DELETE FROM schedule").run();
}
