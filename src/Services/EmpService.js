import axios from "axios";

const API_URL = 'https://dummyjson.com/users';

class EmployeeService {
  getAllEmployees = async () => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  };
}

export default EmployeeService=new EmployeeService();
