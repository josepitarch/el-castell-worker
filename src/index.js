export default {
  async fetch(request, env) {
    try {
      const csvFileName = "el-castell-schedule.csv";

      const object = await env.MY_BUCKET.get(csvFileName);
      if (!object) {
        return new Response("Archivo CSV no encontrado", { status: 404 });
      }

      const csvText = await object.text();

      const jsonData = processFile(csvText);

      return new Response(JSON.stringify(jsonData, null, 2), {
        headers: { "Content-Type": "application/json" },
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
    const values = line.split(";").map(value => value.trim()); // Obtener valores limpios
    const current = {};
    
    headers.forEach((header, index) => {
      current[header] = values[index] !== undefined ? values[index] : null;
    });

    return current;
  });
}