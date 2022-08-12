var connect = require('connect');
var serveStatic = require('serve-static');
const PORT = 3001;
connect()
    .use(serveStatic("public"))
    .listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));