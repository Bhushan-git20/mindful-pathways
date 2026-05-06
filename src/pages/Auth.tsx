import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const authSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().optional(),
});
type AuthFormData = z.infer<typeof authSchema>;

export default function Auth() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema)
  });

  const onSubmit = async (data: AuthFormData) => {
    setIsLoading(true);
    try {
      if (mode === 'signin') {
        const { error } = await signIn(data.email, data.password);
        if (!error) navigate('/dashboard');
      } else {
        const { error } = await signUp(data.email, data.password, data.fullName || 'User', 'student');
        if (!error) setMode('signin');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen luminous-mesh text-on-surface p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 orb-glow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/10 orb-glow"></div>
      
      <main className="relative z-10 w-full max-w-lg">
        <div className="clay-card-auth p-8 md:p-14 flex flex-col items-center">
          <div className="mb-10 text-center flex flex-col items-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4 clay-button-primary">
              <span className="material-symbols-outlined text-on-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
            </div>
            <h1 className="text-4xl font-display font-bold text-white tracking-tight">MindMate</h1>
            <p className="text-base text-muted-foreground mt-2">
              {mode === 'signin' ? 'Welcome back to your inner peace.' : 'Your journey to cognitive clarity starts here.'}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
            {mode === 'signup' && (
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-secondary block mb-3 ml-2">FULL NAME</label>
                <input 
                  {...register('fullName')}
                  className="w-full h-14 clay-input rounded-xl border-none text-white px-6 focus:ring-2 focus:ring-primary/50 transition-all font-body-md" 
                  placeholder="John Doe" 
                  type="text"
                />
                {errors.fullName && <p className="text-xs text-red-400 mt-2 ml-2">{errors.fullName.message}</p>}
              </div>
            )}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-secondary block mb-3 ml-2">EMAIL ADDRESS</label>
              <input 
                {...register('email')}
                className="w-full h-14 clay-input rounded-xl border-none text-white px-6 focus:ring-2 focus:ring-primary/50 transition-all font-body-md" 
                placeholder="name@example.com" 
                type="email"
              />
              {errors.email && <p className="text-xs text-red-400 mt-2 ml-2">{errors.email.message}</p>}
            </div>
            <div>
              <div className="flex justify-between mb-3 ml-2">
                <label className="text-xs font-bold uppercase tracking-widest text-secondary">PASSWORD</label>
                {mode === 'signin' && <a className="text-xs font-bold uppercase tracking-widest text-primary hover:text-secondary transition-colors" href="#">FORGOT?</a>}
              </div>
              <div className="relative">
                <input 
                  {...register('password')}
                  className="w-full h-14 clay-input rounded-xl border-none text-white px-6 focus:ring-2 focus:ring-primary/50 transition-all font-body-md pr-12" 
                  placeholder="••••••••" 
                  type={showPassword ? 'text' : 'password'}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400 mt-2 ml-2">{errors.password.message}</p>}
            </div>
            <div className="pt-2">
              <button disabled={isLoading} className="clay-button-primary w-full h-16 rounded-full font-display text-xl font-semibold text-white active:scale-[0.98] transition-transform flex items-center justify-center gap-3" type="submit">
                {isLoading ? <Loader2 className="animate-spin" /> : (mode === 'signin' ? 'Sign In' : 'Create Account')}
                {!isLoading && <span className="material-symbols-outlined">arrow_forward</span>}
              </button>
            </div>
          </form>

          <div className="w-full flex items-center gap-4 my-10">
            <div className="h-px flex-1 bg-white/10"></div>
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">OR CONTINUE WITH</span>
            <div className="h-px flex-1 bg-white/10"></div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full">
            <button onClick={handleGoogleSignIn} disabled={isGoogleLoading} type="button" className="glass-social h-14 rounded-xl flex items-center justify-center gap-3 font-body-md text-white">
              {isGoogleLoading ? <Loader2 className="animate-spin" /> : <img alt="Google" className="w-5 h-5 opacity-80 grayscale brightness-200" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhQjqgk05Z0VMKU0ULMTbY_Vde-J5rPomIzkg_p-CV51JH66vrwMY5S-xEFgVuMTrI42JR9A6kwj_2iD-BTLSv22yfzEhdjynaZCJP6Y2ZYgBlSMu1JCXok99nIKnzOgrWVqxjxvsXa2kVPoSGxR27t-J8rX1oy1Q7xspIraiSJuuHlFoTD_JtRbjf4M28R7gagFn4hRKnbegCIsdHLXZVJeyxIg4sgrSd43AbjjJgg0BeohIR7gD4bgqkq5_Th_9TF9qQvT91k_7N"/>}
              Google
            </button>
            <button type="button" className="glass-social h-14 rounded-xl flex items-center justify-center gap-3 font-body-md text-white">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>ios</span>
              Apple
            </button>
          </div>

          <div className="mt-12 text-center">
            <p className="text-base text-muted-foreground">
              {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
              <button onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')} type="button" className="text-primary font-bold hover:underline decoration-primary/30 underline-offset-4 ml-1">
                {mode === 'signin' ? 'Create Account' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </main>

      {/* Floating Helpers */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-3 z-20">
        <div className="glass-social px-4 py-2 rounded-full flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-secondary">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
          ENCRYPTED CONNECTION
        </div>
      </div>
    </div>
  );
}