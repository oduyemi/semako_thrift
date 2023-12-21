import React, { useState } from "react";
import PropTypes from 'prop-types';
import { Link } from "react-router-dom";
import Button from "./elements/Button";

export const LoginForm = ({ onLogin }) => {
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [flashMessage, setFlashMessage] = useState("");
  
    const handleLogin = async () => {
        try {
          const response = await fetch("/api/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ phone, password }),
          });
      
          if (response.ok) {
            const { pin, nextStep } = await response.json();
            onLogin(pin, nextStep);
          } else {
            const error = await response.json();
            console.log("Actual error message from server:", error.message);
            if (error.message.includes("Phone not registered")) {
                setFlashMessage("Phone not registered. Please register first.");
                window.location.href = "/register"; // or use your preferred method of redirection
              } else {
                setFlashMessage("Incorrect phone number or password");
              }
              setTimeout(() => {
                window.location.href = "/register";
              }, 2000); // Redirect after 2 seconds
          }
        } catch (error) {
          console.error("Error during login:", error);
          setFlashMessage("An error occurred during login. Please try again.");
        }
      };         
    return (
        <form className="w-full max-w-sm">
        {flashMessage && <div className="text-red-500">{flashMessage}</div>}
        <div className="md:flex md:items-center md:justify-center mb-6">
            <div className="md:w-1/3">
            <label className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4" htmlFor="inline-full-name">
                Phone
            </label>
            </div>
            <div className="md:w-2/3">
            <input
                className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
                id="inline-full-name"
                type="number"
                placeholder="Enter Phone number"
                onChange={(e) => setPhone(e.target.value)}
            />
            </div>
        </div>
        <div className="md:flex md:items-center mb-6">
            <div className="md:w-1/3">
            <label className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4" htmlFor="inline-password">
                Password
            </label>
            </div>
            <div className="md:w-2/3">
            <input
                className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
                id="inline-password"
                type="password"
                placeholder="Enter Password"
                onChange={(e) => setPassword(e.target.value)}
            />
            </div>
        </div>
        <div className="md:flex md:items-center mb-6">
            <div className="md:w-1/3"></div>
            <label className="md:w-2/3 block text-gray-500 font-bold">
            <input className="mr-2 leading-tight" type="checkbox" />
            <span className="text-sm">
                Remember me!
            </span>
            </label>
        </div>
        <div className="md:flex md:items-center">
            <div className="md:w-1/3"></div>
            <div className="md:w-2/3">
            <Button
                onClick={handleLogin}
                className="shadow bg-[#BA1B1D] hover:bg-[#68A691]focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded"
                type="button"
            >
                Login
            </Button>
            </div>
            <div className="text-center my-3">
            <span className="text-brownie ps-3 text-xs mr-3">
                Not Registered Yet?{" "}
                <Link className="text-goldie" to="/register">
                Click Here
                </Link>
            </span>
            </div>
        </div>
        </form>
    );
    };

LoginForm.propTypes = {
    onLogin: PropTypes.func.isRequired,
  };






export const RegisterForm = () => {
    const [formData, setFormData] = useState({
        fname: "",
        lname: "",
        address: "",
        pwd: "",
        cpwd: "",
      });
    
      const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
      };
    
      const handleRegister = async () => {
        try {
          const response = await fetch("/api/register", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          });
    
          if (response.ok) {
          } else {
            const error = await response.json();
            console.error("Registration failed:", error.message);
          }
        } catch (error) {
          console.error("Error during registration:", error);
        }
      };    
    return(
        <form className="w-full max-w-sm">
            <div className="md:flex md:items-center md:justify-center mb-6">
                <div className="md:w-1/3">
                <label className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4" for="fname">
                    First Name
                </label>
                </div>
                <div className="md:w-2/3">
                <input className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500" name="fname" type="text" placeholder="Enter first name" />
                </div>
            </div>
            <div className="md:flex md:items-center md:justify-center mb-6">
                <div className="md:w-1/3">
                <label className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4" for="lname">
                    Last Name
                </label>
                </div>
                <div className="md:w-2/3">
                <input className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500" name="lname" type="text" placeholder="Enter last name" />
                </div>
            </div>
            <div className="md:flex md:items-center md:justify-center mb-6">
                <div className="md:w-1/3">
                <label className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4" for="address">
                    Address
                </label>
                </div>
                <div className="md:w-2/3">
                <textarea className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500" name="address" placeholder="Enter your address"></textarea>
                </div>
            </div>
            <div className="md:flex md:items-center mb-6">
                <div className="md:w-1/3">
                <label className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4" for="pwd">
                    Password
                </label>
                </div>
                <div className="md:w-2/3">
                <input className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500" name="pwd" type="password" placeholder="Create Password" />
                </div>
            </div>
            <div className="md:flex md:items-center mb-6">
                <div className="md:w-1/3">
                <label className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4" for="cpwd">
                    Confirm Password
                </label>
                </div>
                <div className="md:w-2/3">
                <input className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500" name="cpwd" type="password" placeholder="Confirm Password" />
                </div>
            </div>
            <div className="md:flex md:items-center">
                <div className="md:w-1/3"></div>
                <div className="md:w-2/3">
                <button className="shadow bg-[#BA1B1D] hover:bg-[#68A691]focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded" type="button">
                    Register
                </button>
                </div>
            </div>
        </form>
    )
}


export const ResetForm = () => {
    return(
        <form className="w-full max-w-sm">
            <div className="md:flex md:items-center mb-6">
                <div className="md:w-1/3">
                <label className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4" for="pwd">
                    New Password
                </label>
                </div>
                <div className="md:w-2/3">
                <input className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500" name="pwd" type="password" placeholder="Enter New Password" />
                </div>
            </div>
            <div className="md:flex md:items-center mb-6">
                <div className="md:w-1/3">
                <label className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4" for="cpwd">
                    Confirm
                </label>
                </div>
                <div className="md:w-2/3">
                <input className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500" name="cpwd" type="password" placeholder="Confirm Password" />
                </div>
            </div>
            <div className="md:flex md:items-center">
                <div className="md:w-1/3"></div>
                <div className="md:w-2/3">
                <button className="shadow bg-[#BA1B1D] hover:bg-[#68A691]focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded" type="button">
                    Reset Password
                </button>
                </div>
            </div>
        </form>
    )
}