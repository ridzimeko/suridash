import { login } from "@/services/auth";
import { Activity } from "lucide-react";
import { useState, type ReactElement } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Navigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";

export default function LoginPage(): ReactElement {
    const { user, loading: authLoading } = useAuth();
    
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const [serverError, setServerError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    if (authLoading) {
        return <div className="w-full h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!authLoading && user) {
        return <Navigate to="/" replace />;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async function onSubmit(data: any) {
        setServerError("");
        setLoading(true);

        try {
            await login(data.email, data.password);
            
            setTimeout(() => {
                navigate("/", { replace: true });
            }, 50);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            let msg = "Login gagal, periksa email & password.";
            if (err.response) {
                try {
                    const errData = await err.response.json();
                    msg = errData.error || msg;
                } catch (e) {}
            }
            setServerError(msg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="w-full h-screen flex flex-col items-center justify-center px-4">
            <div className="max-w-sm w-full text-gray-600">
                <div className="text-center">
                    <div className="flex justify-center items-center gap-2 px-6">
                        <Activity className="h-8 w-8 text-primary" />
                        <h1 className="text-xl font-bold text-primary">SuriDash</h1>
                    </div>
                    <div className="mt-5 space-y-2">
                        <h3 className="text-gray-800 text-2xl font-bold sm:text-3xl">
                            Welcome back!
                        </h3>
                        <p className="text-gray-500">
                            Sign in to your account to continue
                        </p>
                    </div>
                </div>

                {/* FORM LOGIN */}
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="mt-8 space-y-5"
                >
                    {/* ERROR DARI SERVER */}
                    {serverError && (
                        <p className="text-red-500 text-center text-sm">{serverError}</p>
                    )}

                    {/* EMAIL */}
                    <div>
                        <label className="font-medium">Email</label>
                        <input
                            type="email"
                            className={`w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border
                                ${errors.email ? "border-red-500" : "focus:border-indigo-600"}
                                shadow-sm rounded-lg`}
                            {...register("email", {
                                required: "Email wajib diisi",
                            })}
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm">{errors.email.message?.toString()}</p>
                        )}
                    </div>

                    {/* PASSWORD */}
                    <div>
                        <label className="font-medium">Password</label>
                        <input
                            type="password"
                            className={`w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border
                                ${errors.password ? "border-red-500" : "focus:border-indigo-600"}
                                shadow-sm rounded-lg`}
                            {...register("password", {
                                required: "Password wajib diisi",
                            })}
                        />
                        {errors.password && (
                            <p className="text-red-500 text-sm">{errors.password.message?.toString()}</p>
                        )}
                    </div>

                    {/* BUTTON LOGIN */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-4 py-2 text-white font-medium bg-primary hover:bg-primary/80 disabled:bg-primary/50 disabled:cursor-not-allowed rounded-lg duration-150"
                    >
                        Sign in
                    </button>
                </form>
            </div>
        </main>
    )
}