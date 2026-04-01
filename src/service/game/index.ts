import api from "../api";

export const callGetAvailableGameName = async () => {
  try {
    const response = await api.get(`/GameAdmin/GetAvailableGameName`);
    return response;
  } catch (error) {
    throw error;
  }
};
