export default interface User {
  userId: number;
  username: string;
  name: string;
  surname: string;
  email: string;
  role: 'admin' | 'guest' | 'registered';
  phone: string;
}