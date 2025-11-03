import { useState } from "react";
import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";
import {useNavigate} from 'react-router-dom'
import useAuthStore from "../../store/authStore";

export default function Register() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    password2: "",
    user_type: "",
  });

  const navigate = useNavigate()
  const register = useAuthStore((state) => state.register)


  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(formData.password !== formData.password2){
      alert("Passwords don't match")
      return
    }

    try{
      const response = await register({...formData})
      if(response.ok){
        navigate('/login')
      }
    }
    catch(error){
      console.error(error)
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-950 via-slate-900 to-slate-800">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-gradient-glass backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-neon"
      >
        <div className="text-center mb-8">
          <UserPlus className="w-10 h-10 mx-auto text-indigo-400" />
          <h1 className="text-2xl font-semibold text-white mt-2">Create Account</h1>
          <p className="text-gray-400 text-sm">Join us and start your journey</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="first_name"
            placeholder="First Name"
            onChange={handleChange}
            required
            className="col-span-1 p-3 rounded-xl bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="text"
            name="last_name"
            placeholder="Last Name"
            onChange={handleChange}
            required
            className="col-span-1 p-3 rounded-xl bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
            className="col-span-2 p-3 rounded-xl bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
            className="col-span-2 p-3 rounded-xl bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="password"
            name="password2"
            placeholder="Confirm Password"
            onChange={handleChange}
            required
            className="col-span-2 p-3 rounded-xl bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <select
            name="user_type"
            onChange={handleChange}
            required
            value={formData.user_type}
            className="col-span-2 p-3 rounded-xl bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
          >
            <option value="" disabled>
              Select User Type
            </option>
            <option value="customer">Customer</option>
            <option value="representative">Representative</option>
          </select>

          <motion.button
            whileTap={{ scale: 0.97 }}
            className="col-span-2 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-medium transition-all mt-4"
          >
            Register
          </motion.button>
        </form>

        <p className="text-center text-purple-200 mt-6">
        Already have an account?{' '}
        <button 
            className="text-pink-300 hover:text-pink-200 font-semibold transition-colors"
            onClick={() => navigate('/login')}
        >
            Login
        </button>
        </p>
      </motion.div>
    </div>
  );
}