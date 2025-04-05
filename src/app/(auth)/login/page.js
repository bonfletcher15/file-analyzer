'use client';

import { login } from "@/server/authActions";
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .max(16, 'Password must be less than 16 characters.')
    .refine(value => /[0-9]/.test(value), {
      message: 'Password must include at least one number',
    })
    .refine(value => /[!@#$%^&*(),.?":{}|<>+-]/.test(value), {
      message: 'Password must include at least one special character',
    })
    .refine(value => !/\s/.test(value), {
      message: 'Password must not contain spaces',
    }),
});

const LoginForm = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({ email: '', password: '', general: '' });
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (formData) => {
    startTransition(async () => {
      try {
        loginSchema.parse(formData);

        // const result = await login(formData.email, formData.password);

        // if (result?.error) {
        //   setErrors({ email: "", password: '', general: result.error });
        // } else {
          router.push('/dashboard');
        // }
      } catch (error) {
        if (error instanceof z.ZodError) {
          const newErrors = {};
          error.errors.forEach((err) => {
            newErrors[err.path[0]] = err.message;
          });
          setErrors(newErrors);
        }
      }
    });
  };

  return (
    <form action={() => {handleLogin(formData); }} className="bg-white flex flex-col p-8 rounded-xl shadow-lg w-96 mx-auto mt-20 gap-6">
      <h1 className="text-3xl font-semibold text-center mb-2 text-gray-800">Login</h1>

      <div>
        <input
          name="email"
          type="text"
          placeholder="Email"
          value={formData.email}
          onChange={handleInputChange}
          className={`w-full border p-3 rounded-md  transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ring-red-400 focus:ring-red-500 hover:scale-[1.005] active:scale-[0.995] ${errors.email ? 'border-red-800 text-red-800' : 'border-gray-300 text-gray-900'}`}
        />
        {errors.email && <span className="text-red-800 text-sm">{errors.email}</span>}
      </div>

      <div>
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleInputChange}
          className={`w-full border p-3 rounded-md  transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ring-red-400 focus:ring-red-500 hover:scale-[1.005] active:scale-[0.995] ${errors.password ? 'border-red-800 text-red-800' : 'border-gray-300 text-gray-900'}`}
        />
        {errors.password && <span className="text-red-800 text-sm">{errors.password}</span>}
      </div>
      
      {errors.general && <span className="text-red-800 text-sm">{errors.general}</span>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full flex justify-center p-3 rounded-md font-semibold transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-green-500 hover:bg-green-600 focus:ring-green-200 text-white">
        Sign in
      </button>

      <div className="text-center">
        <Link href="/register" className="text-black-400 hover:text-blue-900 transition-all">
          Register an account
        </Link>
      </div>
    </form>
  );
};

export default LoginForm;

