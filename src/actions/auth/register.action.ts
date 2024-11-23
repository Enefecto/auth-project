import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  type AuthError,
} from "firebase/auth";
import { firebase } from "../../firebase/config";

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
    // Cookies
    if (remember_me) {
      cookies.set("email", email, {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365), // 1 año,
        path: "/",
      });
    } else {
      cookies.delete("email", {
        path: "/",
      });
    }

    // Creación de usuario

    try {
      const userCredential = await createUserWithEmailAndPassword(
        firebase.auth,
        email,
        password
      );

      updateProfile(firebase.auth.currentUser!, {
        displayName: name,
      });

      sendEmailVerification(firebase.auth.currentUser!, {
        url: "http://localhost:4321/protected",
      });

      // Extrae sólo la información serializable
      const user = userCredential.user;
      return {
        uid: user.uid,
        email: user.email,
        // Puedes agregar más campos si los necesitas
      };
    } catch (error) {
      const firebaseError = error as AuthError;
      if (firebaseError.code === "auth/email-already-in-use") {
        throw new Error("El correo ya está en uso");
      }

      throw new Error("Auxilio! algo salió mal");
    }
  },
});
