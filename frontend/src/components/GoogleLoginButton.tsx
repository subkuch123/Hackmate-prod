import { useEffect, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import { useAppDispatch } from "@/hooks/authHook";
import { googleAuth } from "@/store/slices/authSlice";
import { showError, showSuccess } from "@/components/ui/ToasterMsg";

interface GoogleCredentialResponse {
  credential: string;
}

interface DecodedGoogleToken {
  email: string;
  name: string;
  picture: string;
  email_verified: boolean;
}

export default function GoogleLoginButton() {
  const dispatch = useAppDispatch();
  const buttonDivRef = useRef<HTMLDivElement>(null);

  const handleCredentialResponse = async (
    response: GoogleCredentialResponse
  ) => {
    try {
      const token = response.credential;
      const user = jwtDecode<DecodedGoogleToken>(token);

      const result = await dispatch(
        googleAuth({
          email: user.email,
          displayName: user.name,
          photoURL: user.picture,
          email_verified: user.email_verified,
        })
      );

      if (googleAuth.fulfilled.match(result)) {
        showSuccess("Google login successful!", "Success", 3000);
      } else {
        showError(result.error?.message || "Google login failed.", "Error", 5000);
      }
    } catch (err) {
      console.error(err);
      showError("Google login failed. Please try again.", "Error", 5000);
    }
  };

  useEffect(() => {
    if (!window.google || !buttonDivRef.current) return;

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "338785429760-0rd0gkm39tn15ocsa0387basie7phaua.apps.googleusercontent.com", // ✅ ENV SAFE
      callback: handleCredentialResponse,
    });

    window.google.accounts.id.renderButton(buttonDivRef.current, {
      theme: "outline",
      size: "large",
      shape: "rectangular",
      text: "signin_with",
      width: 260, // ✅ MUST be number
    });

    return () => {
      window.google.accounts.id.cancel();
    };
  }, []);

  return (
    <div className="w-full flex justify-center">
      <div ref={buttonDivRef} />
    </div>
  );
}
