import ibkrClient from "../services/ibkrService.js";

const keepAlive = () => {
  setInterval(async () => {
    try {
      const active = await ibkrClient.get(
        "/tickle"
      );

      console.log(
        "IBKR session alive"
      );
    } catch (error) {
      console.log(
        "IBKR session expired"
      );
    }
  }, 60000); // every 1 minute
};

export default keepAlive;