import './App.css'
import Login from './components/Login'
import Register from './components/Register'
import {Routes, Route} from 'react-router-dom'
import Home  from './components/Home'
import ProtectedRoutes from './components/ProtectedRoutes'
import { useEffect } from 'react'
import useAuthStore from '../store/authStore'
import Customer from './components/Customer'
import Representative from './components/Representative'


function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);

  // initializing the auth state when the user first comes
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]); // Run only once on mount

  // Display a loading indicator while authentication status is being determined
  if (isAuthLoading) {
    return <div>Loading authentication...</div>;
  }
  
  return (
    <>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />

        {/* 
          Protected Routes
          is user authenticated then only visible
          */}
        <Route element={<ProtectedRoutes />} >
          <Route path='/' element={<Home />} />
          <Route path='/customer' element={<Customer />} />
          <Route path='/representative' element={<Representative />} />
        </Route>
        
        
      </Routes>
    </>
  )
}

export default App
