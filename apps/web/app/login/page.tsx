import { GoogleSignInButton } from "../../components/auth/GoogleSignInButton";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black p-4">
      <div className="max-w-md w-full p-8 sm:p-10 bg-white dark:bg-zinc-900/50 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] border border-gray-100 dark:border-zinc-800/50 flex flex-col items-center">
        
        <div className="w-12 h-12 bg-zinc-900 dark:bg-white rounded-xl flex items-center justify-center mb-6">
          <svg className="w-6 h-6 text-white dark:text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900 dark:text-white text-center">
          Welcome to Domus
        </h1>
        <p className="text-gray-500 dark:text-zinc-400 mb-8 text-center text-sm sm:text-base">
          Log in or create an account to securely access your home dashboard.
        </p>
        
        <GoogleSignInButton />
        
        <p className="mt-8 text-xs text-gray-400 dark:text-zinc-500 text-center max-w-[280px]">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
