import User from "../models/Users/user";

// En un entorno de desarrollo solo frontend, simulamos la codificación y decodificación
// de JWT, que esencialmente es Base64.
// En un backend real, este proceso involucraría una clave secreta para la firma (signature).

// Función para simular la codificación (generación) de un JWT
export function encodeToken(user: User): string {
  // 1. Crear el 'payload' (datos visibles)
  const payload = {
    userId: user.id,
    username: user.username,
    role: user.role,
    // La fecha de expiración es crucial en un JWT real
    exp: Math.floor(Date.now() / 1000) + (60 * 60) // Expira en 1 hora
  };

  // 2. Codificación Base64Url (simulación simple)
  // Usamos btoa() y atob() que son nativos del navegador para simular Base64 simple.
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const payloadEncoded = btoa(JSON.stringify(payload));
  
  // 3. Juntar las partes (header.payload.signature)
  // Como no tenemos clave secreta en el frontend, la 'signature' es un placeholder.
  return `${header}.${payloadEncoded}.MOCK_SIGNATURE`;
}

// Función para simular la decodificación de la carga útil (payload) de un JWT
// Esta función es usada por el cliente para leer los datos (role, userId).
export function decodeToken(token: string): { userId: string, role: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null; // Formato inválido
    }
    
    // Decodificar solo la segunda parte (payload)
    const payloadEncoded = parts[1];
    
    // Usamos atob() para decodificar el Base64
    const decodedPayload = JSON.parse(atob(payloadEncoded));

    // Comprobar expiración (simulación de validación)
    if (decodedPayload.exp * 1000 < Date.now()) {
        console.warn('Token expirado (MOCK)');
        return null;
    }

    return decodedPayload as { userId: string, role: string };
  } catch (error) {
    console.error('Error al decodificar el token:', error);
    return null;
  }
}

// Función que simplemente verifica si un token está presente y no ha expirado
export function isTokenValid(token: string): boolean {
    return !!decodeToken(token);
}