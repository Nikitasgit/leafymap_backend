import app from "./app";
import "dotenv/config";
import MongooseEventRepository from "./repositories/events/MongooseEventRepository";
import EventsCronService from "./services/cron/EventsCronService";

const PORT = process.env.PORT || 3000;

const eventRepository = new MongooseEventRepository();
const eventsCronService = new EventsCronService(eventRepository);
eventsCronService.start();

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
