require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const { logger } = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const cookieParse = require("cookie-parser");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const connectDB = require("./config/dbConn");
const mongoose = require("mongoose");
const { logEvents } = require("./middleware/logger");

const PORT = process.env.PORT || 3500;

connectDB();

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParse());
app.use(logger);
app.use(errorHandler);
app.use("/", express.static(path.join(__dirname, "public")));

app.use("/", require("./routes/root"));
app.use("/users", require("./routes/userRoutes"));
app.use("/notes", require("./routes/noteRoutes"));

app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "notFound.html"));
  } else if (req.acceptsEncodings("json")) {
    res.join({ message: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

mongoose.connection.on("error", (err) => {
  console.log(err);
  logEvents(
    `${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
    "mongoErrLog.log"
  );
});


/* Definimos la constante PORT para indicar en que puerto de va a deployar 

app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); -> abrimos el puerto para que pueda ser escuchado 
app.use("/", express.static(path.join(__dirname, "public"))); -> indicamos en que carpeta tiene que buscar los archivos estaticos
app.use("/", require("./routes/root")); -> Indicamos la ruta principal de la raiz
app.all("*") -> Todas las llamadas que lleguen seran filtradas en base a las codniciones indicadas en esta funcion
app.use(express.json()); -> Permite procesas datos en formato json

*/