// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
        interface Locals {
          // Legacy properties for backward compatibility (will be deprecated)
          user: import("$lib/server/auth").SessionValidationResult["user"];
          session: import("$lib/server/auth").SessionValidationResult["session"];

          // New dual-session properties
          adminUser?: import("$lib/server/auth").SessionValidationResult["user"];
          adminSession?: import("$lib/server/auth").SessionValidationResult["session"];

          // Client context
          clientUser?: {
            id: number;
            nombre: string;
            apellido: string;
            correo: string;
            casillero: string;
            codificacion: string | null;
            tipo: 'REGULAR' | 'ESPECIAL' | 'CORPORATIVO';
            sucursalId: number;
          };
          clientSession?: {
            id: string;
            clientId: number;
            userAgent: string | null;
            lastActive: Date;
            expiresAt: Date;
            createdAt: Date;
          };
        }
    }
}

export {};
