import { useState } from "react";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";
import {useNavigate} from 'react-router-dom'
import useAuthStore from "../../store/authStore";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const login = useAuthStore((state) => state.login)

  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try{
      const response = await login({...formData})
      if(response.ok){
        navigate('/')
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
        className="w-full max-w-md bg-gradient-glass backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-neon"
      >
        <div className="text-center mb-8">
          <LogIn className="w-10 h-10 mx-auto text-indigo-400" />
          <h1 className="text-2xl font-semibold text-white mt-2">Welcome Back</h1>
          <p className="text-gray-400 text-sm">Login to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Email</label>
            <input
              type="email"
              name="email"
              onChange={handleChange}
              className="w-full p-3 rounded-xl bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Password</label>
            <input
              type="password"
              name="password"
              onChange={handleChange}
              className="w-full p-3 rounded-xl bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-medium transition-all"
          >
            Sign In
          </motion.button>
        </form>
        <p className="text-center text-purple-200 mt-6">
        Don't have an account?{' '}
        <button 
            className="text-pink-300 hover:text-pink-200 font-semibold transition-colors"
            onClick={() => navigate('/register')}
        >
            Register
        </button>
        </p>
      </motion.div>
    </div>
  );
}