import axios from "axios"

const baseURL = "http://localhost:8080"

const login = (data) => {
  return axios.post("http://localhost:8080/login",data)
}
const register = (data) => {
  return axios.post("http://localhost:8080/register",data)
}
export default { 
  login:login,
  register:register
}
