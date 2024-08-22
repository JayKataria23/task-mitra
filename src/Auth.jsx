import { useState } from "react";
import { supabase } from "./utils/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import NxtGen from "./assets/NxtGen.png";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();

    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });

    if (error) {
      alert(error.error_description || error.message);
    } else {
      alert("Check your email for the login link!");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-400 to-blue-500">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-2xl">
        <div className="flex justify-center">
          <img src={NxtGen} alt="NxtGen Logo" className="w-48 h-auto" />
        </div>
        <h1 className="text-3xl font-bold text-center text-gray-800">
          Welcome to NxtGen
        </h1>
        <p className="text-center text-gray-600">
          Enter your email to receive a magic link and get started!
        </p>
        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <Button
            disabled={loading}
            type="submit"
            className="w-full px-4 py-2 text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            {loading ? <span>Loading</span> : <span>Send magic link</span>}
          </Button>
        </form>
      </div>
    </div>
  );
}
