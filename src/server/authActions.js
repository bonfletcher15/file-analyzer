"use server";

import prisma from '@/lib/prisma'; 
import { hash, compare } from "bcryptjs";
import { cookies } from "next/headers";
import { encodeJWT, decodeJWT } from '@/utils/jwtUtils';
import { redirect } from 'next/navigation';
import { z } from "zod";

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required.'),
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

export async function register(username, password) {
  try {
    const parsedData = loginSchema.safeParse({ username, password });
    if (!parsedData.success) {
      throw new Error(parsedData.error.errors.map(err => err.message).join(', '));
    }

    // const existingUser = await prisma.user.findUnique({
    //   where: { username },
    // });

    // if (existingUser) {
    //   throw new Error("User already exists");
    // }

    // const hashedPassword = await hash(password, 10);

    // const newUser = await prisma.user.create({
    //   data: {
    //     username,
    //     password: hashedPassword,
    //   },
    //   select: {
    //     id: true,
    //     username: true,
    //   },
    // });

    // const token = await encodeJWT({
    //   id: newUser.id,
    //   username: newUser.username,
    // });

    // await cookies().set("token", token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   maxAge: 60 * 60 * 24,
    //   path: "/",
    // });

  } catch (error) {
    return { error: error.message };
  }
}

export async function login(username, password) {
  try {
    const parsedData = loginSchema.safeParse({ username, password });
    if (!parsedData.success) {
      throw new Error(parsedData.error.errors.map(err => err.message).join(', '));
    }

    // const user = await prisma.user.findUnique({
    //   where: { username },
    //   select: {
    //     id: true,
    //     username: true,
    //     password: true,
    //   },
    // });

    // if (!user) {
    //   throw new Error("Invalid username or password");
    // }

    // const isValid = await compare(password, user.password);
    // if (!isValid) {
    //   throw new Error("Invalid username or password");
    // }

    // const token = await encodeJWT({
    //   id: user.id,
    //   username: user.username,
    // });

    // await cookies().set("token", token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   maxAge: 60 * 60 * 24,
    //   path: "/",
    // });

  } catch (error) {
    return { error: error.message };
  }
}
