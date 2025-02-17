export default {
  async fetch(request, env) {
    try {
      const csvFileName = "el-castell-schedule.csv";

      const object = await env.MY_BUCKET.get(csvFileName);
      if (!object) {
        return new Response("Archivo CSV no encontrado", { status: 404 });
      }

      const csvText = await object.text();

      await save(processFile(csvText), env.MY_DATABASE);

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
    return col.split('-').map(time => time.trim())
  }

  await clearTable(db);

  for (const row of data) {
    const { SABADO, SEMANAL } = row;
    const saturday = getTime(SABADO);
    const weekday = getTime(SEMANAL);

    await db.prepare(
      `INSERT INTO schedule (area, smallholding, hanegadas, community, fire_hydrant, sector, saturday_start_time, saturday_end_time, weekday_start_time, weekday_end_time) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      row.POL, row.PARC, row.HG, row.SOCIEDAD, row.HIDRANTE, row.SECTOR, saturday.at(0), saturday.at(1), weekday.at(0), weekday.at(1)
    ).run();
  }
}

async function clearTable(db) {
  await db.prepare("DELETE FROM schedule").run();
}
