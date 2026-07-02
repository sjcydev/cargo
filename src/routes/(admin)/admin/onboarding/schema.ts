import { z } from "zod";

type ImageDimensions = {
  width: number;
  height: number;
};

const isFileLike = (value: unknown): value is File =>
  typeof value === "object" &&
  value !== null &&
  "arrayBuffer" in value &&
  typeof value.arrayBuffer === "function" &&
  "size" in value &&
  typeof value.size === "number" &&
  "type" in value &&
  typeof value.type === "string";

async function getImageDimensions(file: File): Promise<ImageDimensions | null> {
  const buffer = await file.arrayBuffer();
  const view = new DataView(buffer);

  if (buffer.byteLength < 10) return null;

  const isPng =
    view.getUint32(0) === 0x89504e47 && view.getUint32(4) === 0x0d0a1a0a;
  if (isPng && buffer.byteLength >= 24) {
    return {
      width: view.getUint32(16),
      height: view.getUint32(20),
    };
  }

  const isGif =
    view.getUint8(0) === 0x47 &&
    view.getUint8(1) === 0x49 &&
    view.getUint8(2) === 0x46;
  if (isGif && buffer.byteLength >= 10) {
    return {
      width: view.getUint16(6, true),
      height: view.getUint16(8, true),
    };
  }

  const isJpeg = view.getUint8(0) === 0xff && view.getUint8(1) === 0xd8;
  if (isJpeg) {
    let offset = 2;

    while (offset + 9 < buffer.byteLength) {
      if (view.getUint8(offset) !== 0xff) return null;

      const marker = view.getUint8(offset + 1);
      const length = view.getUint16(offset + 2);
      const isStartOfFrame =
        marker >= 0xc0 &&
        marker <= 0xcf &&
        marker !== 0xc4 &&
        marker !== 0xc8 &&
        marker !== 0xcc;

      if (isStartOfFrame) {
        return {
          height: view.getUint16(offset + 5),
          width: view.getUint16(offset + 7),
        };
      }

      offset += 2 + length;
    }
  }

  const isWebp =
    view.getUint32(0) === 0x52494646 && view.getUint32(8) === 0x57454250;
  if (isWebp && buffer.byteLength >= 30) {
    const format = String.fromCharCode(
      view.getUint8(12),
      view.getUint8(13),
      view.getUint8(14),
      view.getUint8(15)
    );

    if (format === "VP8X") {
      return {
        width:
          1 +
          view.getUint8(24) +
          (view.getUint8(25) << 8) +
          (view.getUint8(26) << 16),
        height:
          1 +
          view.getUint8(27) +
          (view.getUint8(28) << 8) +
          (view.getUint8(29) << 16),
      };
    }

    if (format === "VP8 " && buffer.byteLength >= 30) {
      return {
        width: view.getUint16(26, true) & 0x3fff,
        height: view.getUint16(28, true) & 0x3fff,
      };
    }

    if (format === "VP8L" && buffer.byteLength >= 25) {
      const bits =
        view.getUint8(21) |
        (view.getUint8(22) << 8) |
        (view.getUint8(23) << 16) |
        (view.getUint8(24) << 24);

      return {
        width: (bits & 0x3fff) + 1,
        height: ((bits >> 14) & 0x3fff) + 1,
      };
    }
  }

  return null;
}

export const companiesSchema = z.object({
  company: z.string({
    required_error: "Nombre de la Organización es requerida",
  }),
  logo: z
    .custom<File>((value) => isFileLike(value), {
      message: "Debes subir un logo.",
    })
    .refine((f) => f.size < 20_000_000, "Logo debe ser menor a 20MB.")
    .refine(
      async (file) => {
        if (!file.type.startsWith("image/")) return false;

        const dimensions = await getImageDimensions(file);

        return dimensions ? dimensions.width > dimensions.height : false;
      },
      {
        message:
          "El logo debe ser horizontal o rectangular (ancho mayor que alto). Resoluciones sugeridas: 800x400, 1200x600, 1600x800, o 2000x1000 píxeles.",
      }
    ),
  dominio: z.string({ required_error: "Dominio es requerido" }),
});

export const sucursalesSchema = z.intersection(
  companiesSchema,
  z.object({
    sucursal: z.string({ required_error: "Sucursal es requerida" }),
    precio: z
      .number()
      .min(0, { message: "Precio debe ser mayor a 0" })
      .optional()
      .nullish(),

    direccion: z.string({
      required_error: "Direccion de la Sucursal es requerida",
    }),
    telefono: z.string({
      required_error: "Telefono de la Sucursal es requerida",
    }),
    codificacion: z
      .string({ required_error: "Codificacion de la Sucursal es requerida" })
      .max(4, { message: "Codificación debe tener 4 o menos caracteres" }),
    correoSucursal: z
      .string({ required_error: "Correo es requerido" })
      .email({ message: "Correo invalido" })
      .trim(),
    maps: z.string().optional().nullish(),
  })
);

export const addressesSchema = z.intersection(
  sucursalesSchema,
  z.object({
    addressName: z.string({ required_error: "Nombre de la dirección es requerido" }),
    address1: z.string({ required_error: "Dirección principal es requerida" }),
    address2: z.string().optional().nullish(),
    zipcode: z.string({ required_error: "Código postal es requerido" }),
    city: z.string({ required_error: "Ciudad es requerida" }),
    country: z.string({ required_error: "País es requerido" }),
    state: z.string({ required_error: "Estado es requerido" }),
    tel: z.string({ required_error: "Teléfono es requerido" }),
  })
);

export const userSignUpSchema = z.intersection(
  addressesSchema,
  z
    .object({
      nombre: z
        .string({ required_error: "Nombre es requerido" })
        .trim()
        .min(1, { message: "Nombre debe tener 1 o más caracteres" }),
      apellido: z
        .string({ required_error: "Apellido es requerido" })
        .trim()
        .min(1, { message: "Apellido debe tener 1 o más caracteres" }),
      correo: z
        .string({ required_error: "Correo es requerido" })
        .email({ message: "Correo invalido" })
        .trim()
        .min(1, { message: "" }),
      username: z
        .string({ required_error: "Username es requerido" })
        .trim()
        .min(3, { message: "Username debe tener 3 o más caracteres" }),
      password: z
        .string({ required_error: "Contraseña es requerido" })
        .min(6, { message: "Contraseña debe tener 6 o más caracteres" }),
      confirm: z.string({
        required_error: "Confirmar contraseña es requerido",
      }),
      rol: z.enum(["ADMIN", "EMPLEADO", "SECRETARIA"]).optional(),
    })
    .refine((data) => data.password === data.confirm, {
      message: "Contraseñas no coinciden",
      path: ["confirm"], // path of error
    })
);

export type userSignUpType = typeof userSignUpSchema;
