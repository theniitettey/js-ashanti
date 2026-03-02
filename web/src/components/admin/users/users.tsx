"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { authClient } from "@/lib/auth-client";
import { toast } from "react-hot-toast";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AiOutlineDelete } from "react-icons/ai";
import { LoaderOne } from "@/components/ui/loader";

type User = {
  id: string;
  name: string;
  email: string;
  role?: string;
};

export enum AdminRole {
  ADMIN = "admin",
}

export function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [open, setOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await authClient.admin.listUsers({ query: { limit: 100, offset: 0 } });
        if (response.data?.users) setUsers(response.data.users);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleSetAdmin = async (userId: string) => {
    try {
      const { data, error } = await authClient.admin.setRole({
        userId,
        role: AdminRole.ADMIN,
      });
      if (error) throw new Error(error.message);
      toast.success(`User ${userId} promoted to admin`);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: AdminRole.ADMIN } : u))
      );
    } catch (e: any) {
      console.error("setRole error:", e);
      toast.error(e?.message || "Failed to update role");
    }
  };

  const handleRemoveUser = async () => {
    if (!selectedUserId) return;
    try {
      const { error } = await authClient.admin.removeUser({ userId: selectedUserId });
      if (error) throw new Error(error.message);
      setUsers((prev) => prev.filter((u) => u.id !== selectedUserId));
      toast.success("User deleted");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Delete failed");
    } finally {
      setOpen(false);
      setSelectedUserId(null);
    }
  };

  if (loading) {
    return (
      <div className="h-dvh flex justify-center items-center mx-auto">
        <LoaderOne />
      </div>
    );
  }
  

  return (
    <>
      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader className="bg-muted sticky top-0 z-10">
            <TableRow className="p-4">
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="h-20">{user.name}</TableCell>
                <TableCell className="h-20">{user.email}</TableCell>
                <TableCell className="h-20">{user.role || "-"}</TableCell>
                <TableCell className="h-20 flex justify-evenly gap-4">
                  {user.role !== AdminRole.ADMIN && (
                    <>
                      <button
                        onClick={() => handleSetAdmin(user.id)}
                        className="text-sm text-blue-600 hover:"
                      >
                        Upgrade to Admin
                      </button>
                      
                    </>
                  )}
                  <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            onClick={() => {
                              setSelectedUserId(user.id);
                              setOpen(true);
                            }}
                            className="text-sm text-red-600 hover:underline flex items-center"
                          >
                            <AiOutlineDelete className="mr-1 text-xl" /> Delete
                          </button>
                        </AlertDialogTrigger>
                    </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveUser}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
