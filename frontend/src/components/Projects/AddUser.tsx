import { use, type SubmitEventHandler } from 'react';
import Button from '../Button/Button';
import styles from './CreateProject.module.css';

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
  setUserToAdd,
  newRole,
  setNewRole,
  handleAdd,
  setAddUser,
}: Props) {
  return <>{void userToAdd}</>;
}
