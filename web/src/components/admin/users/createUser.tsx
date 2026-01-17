"use client";
import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { authClient } from "@/lib/auth-client";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

enum Role {
  ADMIN = "admin",
}

interface CreateUserForm {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export function NewUserForm() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateUserForm>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: Role.ADMIN,
    },
  });

  const onSubmit: SubmitHandler<CreateUserForm> = async (data) => {
    try {
      const response = await authClient.admin.createUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        data: { customField: "customValue" },
      });

      if ("error" in response && response.error) throw new Error(response.error.message);

      const newUser = response.data;
      toast.success(`User ${newUser?.user?.email} created successfully`);
      reset(); // Reset form after successful submission
      router.push("/admin/users/allUsers");
    } catch (err: any) {
      console.error("Create user error:", err);
      toast.error(err?.message || "Failed to create user");
    }
  };

  return (
    <div className="max-w-lg p-4 sm:p-6 rounded-md shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-center">Create New User</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            {...register("name", { required: "Name is required" })}
            className={`mt-1 block w-full rounded-md px-3 py-2 border ${
              errors.name ? "border-red-500" : "border-gray-300"
            } focus:border-indigo-500`}
          />
          {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            {...register("email", {
              required: "Email is required",
              pattern: { value: /^\S+@\S+$/i, message: "Invalid email address" },
            })}
            className={`mt-1 block w-full rounded-md px-3 py-2 border ${
              errors.email ? "border-red-500" : "border-gray-300"
            } focus:border-indigo-500`}
          />
          {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            {...register("password", {
              required: "Password is required",
              minLength: { value: 8, message: "Minimum length is 8" },
            })}
            className={`mt-1 block w-full rounded-md px-3 py-2 border ${
              errors.password ? "border-red-500" : "border-gray-300"
            } focus:border-indigo-500`}
          />
          {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password.message}</p>}
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium mb-1">Role</label>
          <select
            {...register("role", { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300 focus:border-indigo-500 px-3 py-2"
          >
            <option value={Role.ADMIN}>Admin</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md transition disabled:opacity-50"
        >
          {isSubmitting ? "Creating..." : "Create User"}
        </button>
      </form>
    </div>
  );
}
