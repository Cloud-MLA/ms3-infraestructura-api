require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 3003;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`MS3 corriendo en el puerto ${PORT}`);
    console.log("CAMBIOS DETECTADOS");
  });
});