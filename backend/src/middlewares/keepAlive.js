import ibkrClient from "../services/ibkrService.js";

const keepAlive = () => {
  setInterval(async () => {
    try {
      const active = await ibkrClient.get(
        "/tickle"
      );
      const now = new Date(Date.now());
      console.log(
        `IBKR session alive. Hit at ${now.toString()}`
      );
    } catch (error) {
      console.log(
        "IBKR session expired"
      );
    }
  }, 2 * 60 * 1000); // every 2 minute
};

export default keepAlive;