import express from "express";
import cors from "cors";

//Routes
import categoriesRoutes from "./routes/categoriesRoute.js"
import gamesRoutes from "./routes/gamesRoutes.js"
//


//Configs app
const app = express();

app.use(cors());
app.use(express.json());
app.use(categoriesRoutes);
app.use(gamesRoutes);
//







const port = 4000;
app.listen(port, () => console.log(`Server running in port: ${port}`));