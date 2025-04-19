"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

export default function SignIn() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const error = searchParams.get("error");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Sign in to Wasteland Mods</h1>
          <p className="mt-2 text-gray-600">
            Connect with Discord or Steam to access premium mods and content
          </p>
        </div>

        {error && (
          <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg">
            {error === "OAuthSignin" && "Error starting the sign in process."}
            {error === "OAuthCallback" && "Error completing the sign in process."}
            {error === "OAuthAccountNotLinked" && "This account is not linked to any user."}
            {error === "Callback" && "Error during the OAuth callback."}
            {error === "AccessDenied" && "You denied access to your account."}
            {error === "Default" && "An unexpected error occurred."}
          </div>
        )}

        <div className="mt-6 space-y-4">
          <button
            onClick={() => signIn("discord", { callbackUrl })}
            className="w-full py-3 px-4 flex items-center justify-center space-x-2 rounded-md bg-[#5865F2] text-white hover:bg-[#4752c4] transition duration-200"
          >
            <svg width="24" height="24" viewBox="0 0 71 55" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978Z" fill="white"/>
              <path d="M23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z" fill="white"/>
            </svg>
            <span>Sign in with Discord</span>
          </button>
          
          <button
            onClick={() => signIn("steam", { callbackUrl })}
            className="w-full py-3 px-4 flex items-center justify-center space-x-2 rounded-md bg-[#171a21] text-white hover:bg-[#2a3f5f] transition duration-200"
          >
            <svg width="24" height="24" viewBox="0 0 256 259" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid">
              <path d="M127.778 0C60.522 0 5.212 52.412 0 119.014l68.884 28.561a37.49 37.49 0 0 1 21.609-6.816c.679 0 1.35.023 2.020.067l30.662-44.354a49.373 49.373 0 0 1 2.018-95.88c27.19 0 49.35 22.152 49.35 49.334 0 27.182-22.16 49.334-49.35 49.334-.915 0-1.828-.025-2.732-.078l-43.728 31.22c.036.572.055 1.146.055 1.724 0 20.681-16.846 37.52-37.537 37.52-18.05 0-33.153-12.797-36.75-29.807L5.016 122.425C17.376 199.944 66.918 259 127.778 259c70.57 0 127.777-57.19 127.777-127.724C255.555 57.19 198.348 0 127.778 0zm0 46.365c-15.9 0-28.817 12.913-28.817 28.802 0 15.887 12.917 28.802 28.817 28.802 15.9 0 28.817-12.915 28.817-28.802 0-15.889-12.917-28.802-28.817-28.802zm-98.48 131.815c-10.297 0-18.683-8.414-18.683-18.684 0-10.27 8.386-18.684 18.684-18.684 10.299 0 18.684 8.414 18.684 18.684.001 10.27-8.385 18.684-18.684 18.684z" fill="white"/>
            </svg>
            <span>Sign in with Steam</span>
          </button>
          
          <div className="text-center text-gray-500 text-sm">
            <p>Choose your preferred login method</p>
          </div>
        </div>
      </div>
    </div>
  );
} 