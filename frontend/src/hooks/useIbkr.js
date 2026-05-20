import { useContext } from "react";
import { IbkrContext } from "../context/ibkr-context";

export const useIbkr = () => useContext(IbkrContext);
