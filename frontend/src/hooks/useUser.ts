import { useContext } from "react";
import { UserContext } from "@/context/UserContext";

export function useUser() {
  return useContext(UserContext);
}
