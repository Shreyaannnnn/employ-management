import 'dotenv/config';
import { createApp } from './app.js';
import './db/migrate.js';

const app = createApp();
const PORT = Number(process.env.PORT || 8080);
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;

