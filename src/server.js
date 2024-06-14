import app from './app.js';
import config from './config/index.js';
import connectToDB from './db/index.js';

const main = async () => {
  await connectToDB();

  app.listen(config.PORT, () => {
    console.log(`Server is running on http://localhost:${config.PORT}`);
  });
};

main();
