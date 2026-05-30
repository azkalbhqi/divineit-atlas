"use client";

import { deleteUserAction } from "../actions/users";

interface DeleteUserButtonProps {
  userId: string;
  userName: string;
}

export default function DeleteUserButton({ userId, userName }: DeleteUserButtonProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (
      !confirm(
        `Are you sure you want to delete ${userName}? This will remove them from all projects and time logs.`
      )
    ) {
      e.preventDefault();
    }
  };

  return (
    <form action={deleteUserAction} onSubmit={handleSubmit} className="inline-block">
      <input type="hidden" name="userId" value={userId} />
      <button
        type="submit"
        className="text-[10px] font-bold text-red-500 hover:text-red-400 transition-colors bg-red-500/5 hover:bg-red-500/10 px-2.5 py-1 rounded-lg border border-red-500/10"
      >
        Delete Account
      </button>
    </form>
  );
}
