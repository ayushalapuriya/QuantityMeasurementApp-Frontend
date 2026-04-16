import axiosInstance from "./axiosConfig";

export const convertMeasurement = async (payload, targetUnit) => {
  const response = await axiosInstance.post(
    `/quantity/convert?targetUnit=${targetUnit}`,
    payload
  );
  return response.data;
};

export const compareMeasurement = async (payload) => {
  const response = await axiosInstance.post("/quantity/compare", payload);
  return response.data;
};

export const arithmeticMeasurement = async (payload, operator) => {
  let endpoint = "/quantity/add";

  switch (operator) {
    case "ADD":
      endpoint = "/quantity/add";
      break;
    case "SUBTRACT":
      endpoint = "/quantity/subtract";
      break;
    case "DIVIDE":
      endpoint = "/quantity/divide";
      break;
    default:
      endpoint = "/quantity/add";
  }

  const response = await axiosInstance.post(endpoint, payload);
  return response.data;
};