import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SignupInput } from "@shubham1903/blog";
import axios from "axios"
import {BACKEND_URL} from "../../config"
const Auth = ({ type }: { type: "signup" | "signin" }) => {
  const [postInputs, setPostInput] = useState<SignupInput>({
    name: "",
    username: "",
    password: "",
  });
  const navigate=useNavigate()
  async function sendRequest(){
    try {
        const response=await axios.post(`${BACKEND_URL}/api/v1/user/${type==="signup"?"signup":"signin"}`,postInputs)
        const jwt=response.data
        localStorage.setItem("token",jwt);
        navigate("/blogs")
    } catch (error) {
        
    }
  }
  console.log(postInputs);
  return (
    <div className="h-[89vh] flex justify-center flex-col">
      <div className="flex justify-center">
        <div>
          <div className=" px-10">
            <div className="text-4xl font-extrabold  ">Create an account</div>
            <div className="text-slate-400">
              {type=="signin"?"Don't have an account":"Already have an account?"}
              <Link className="text-blue-800 pl-2 underline" to={type==="signin"?"/signup":"/signin"}>
               {type=="signin"?"Sign up":"Sign in"}
              </Link>
            </div>
          </div>
          <div className="text-left ">
           {type=="signup"? <LabelledInput
              label="Name"
              placeholder="Shubham Nainwal..."
              type="text"
              onChange={(e) => {
                setPostInput((prev) => ({
                  ...prev,
                  name: e.target.value,
                }));
              }}
            />:null}
            <LabelledInput
              label="UserName"
              placeholder="Shubhamnainwal@gmail.com"
              type="email"
              onChange={(e) => {
                setPostInput((prev) => ({
                  ...prev,
                  username: e.target.value,
                }));
              }}
            />
            <LabelledInput
              label="password"
              placeholder="23d1!@@!@#3"
              type="password"
              onChange={(e) => {
                setPostInput((prev) => ({
                  ...prev,
                  password: e.target.value,
                }));
              }}
            />
            <button
              type="button"
              onClick={sendRequest}
              className="mt-8 w-full text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
            >
              {type =="signup"?"Sign up":"Sign in "}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function LabelledInput({
  label,
  placeholder,
  onChange,
  type,
}: {
  label: string;
  placeholder: string;
  onChange: (e: any) => void;
  type: string;
}) {
  return (
    <div className="pt-4">
      <label htmlFor="first_name" className="block mb-2 font-bold text-black  ">
        {label}
      </label>
      <input
        onChange={onChange}
        type={type}
        className="bg-gray-50 h-[3rem] border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
        placeholder={placeholder}
        required
      />
    </div>
  );
}

export default Auth;
