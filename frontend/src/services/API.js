import axios from "axios";

const baseURL = import.meta.env.VITE_BASE_URL;

export default function () {
    console.log("Base URL:", baseURL); 
    return axios.create({
        baseURL: baseURL,
        headers: {
            "Content-Type": "application/json"
        }
    });
}
