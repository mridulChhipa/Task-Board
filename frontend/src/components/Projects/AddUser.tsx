import type { SubmitEventHandler } from 'react';

interface Props {
  userToAdd: number;
  setUserToAdd: React.Dispatch<React.SetStateAction<number>>;
  newRole: string;
  setNewRole: React.Dispatch<React.SetStateAction<string>>;
  handleAdd: SubmitEventHandler;
  setAddUser: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function AddUser({
  userToAdd,
  // setUserToAdd,
  // newRole,
  // setNewRole,
  // handleAdd,
  // setAddUser,
}: Props) {
  return <>{void userToAdd}</>;
}
