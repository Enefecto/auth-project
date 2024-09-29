import { defineAction } from "astro:actions";
import { z } from "astro:schema";

export const registerUser = defineAction({
  accept: "form",
  input: z.object({
    name: z.string().min(2),
    username: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    remember_me: z.boolean().optional(),
  }),
  handler: async (
    { name, username, email, password, remember_me },
    { cookies }
  ) => {
    console.log({ name, username, email, password, remember_me });

    if (remember_me) {
      cookies.set("email", email, {
        expires: new Date(Date.now() + 86400000 /*1 Dia*/ * 365),
        path: "/",
      });
    } else {
      cookies.delete("email", {
        path: "/",
      });
    }

    return { ok: true, msg: "Usuario Creado" };
  },
});
