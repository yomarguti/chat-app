const app = require("./app");
const logger = require("morgan");

app.use(logger);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
