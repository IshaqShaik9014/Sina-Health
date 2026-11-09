import app from './app';
import { ENV } from './config/env';

const PORT = ENV.PORT;

app.listen(PORT, () => {
  console.log(`[SINA Clinical Backend] Running on http://localhost:${PORT}`);
  console.log(`[SINA Health Endpoint] http://localhost:${PORT}/api/v1/health`);
});
