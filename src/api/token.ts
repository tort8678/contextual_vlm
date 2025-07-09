import axios from "axios";

const baseRequest = axios.create({baseURL: "/api"});
export async function getToken() {
  try {
    const response = await baseRequest.get("/token/getToken");
    if (response.data) {
      return {token: response.data.token, region: response.data.region};
    }
  } catch (error) {
    console.error("Error fetching token:", error);
    throw new Error("Failed to fetch token");
  }
}