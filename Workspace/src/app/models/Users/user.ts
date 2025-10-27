export default interface User {
  id: string;
  username: string;
  name: string;
  surname: string;
  email: string;
  role: 'admin' | 'guest' | 'registered';
  phone: string;
  password:string;
}