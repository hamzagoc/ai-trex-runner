import connect from 'connect';
import serveStatic from 'serve-static';

const PORT = 3001;
connect()
    .use(serveStatic("public"))
    .listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));