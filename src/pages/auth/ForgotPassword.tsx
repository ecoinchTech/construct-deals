import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForgotPasswordMutation } from '@/store/api/authApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Mail, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await forgotPassword({ email }).unwrap();
      toast.success(response.message);
      setSubmitted(true);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to send reset email');
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md text-center">
          <div className="mb-8">
            <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Check your email</h2>
            <p className="text-muted-foreground">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Didn't receive the email? Check your spam folder or try again.
            </p>
            <Button
              variant="outline"
              onClick={() => setSubmitted(false)}
              className="w-full"
            >
              Try another email
            </Button>
            <Link to="/auth/login">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to sign in
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-8 bg-background">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Reset your password</h2>
          <p className="text-muted-foreground">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send reset link'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/auth/login" className="text-sm text-primary hover:underline inline-flex items-center">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
