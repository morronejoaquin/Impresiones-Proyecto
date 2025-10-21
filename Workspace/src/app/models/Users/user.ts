export default interface User {
    id: number;
    username: string;
    name: string;
    surname:string;
    email: string;
    role: 'admin' | 'guest' | 'registered';
    phone: string;
}