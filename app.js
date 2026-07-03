import dotenv from "dotenv"
import express from "express"
import cors from "cors"
import reportRoutes from './routes/reportRoutes.js'
import eureka from "./eurukaregister.js";


dotenv.config()
const app = express()


app.use(express.json())

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "report-service" })
})

// Report routes
app.use('/reports', reportRoutes)

app.listen(5000, () => {
  console.log("Report Service running on port 5000")

  eureka.start((error) => {
    if (error) {
      console.log("Eureka registration failed:", error);
    } else {
      console.log("Report-SERVICE registered with Eureka");
    }
  });

})
