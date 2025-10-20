import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import logoImage from '@assets/image_1760164042662.png';

export default function Login() {
  const [location, setLocation] = useLocation();
  const { login, sendOTP, verifyOTP } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [otp, setOtp] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [loginMethod, setLoginMethod] = useState<'email' | 'mobile'>('email');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const role = params.get('role');
    if (role) {
      setSelectedRole(role);
    }
  }, [location]);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (loginMethod === 'mobile') {
        await sendOTP(mobileNumber);
        setStep('otp');
        toast({
          title: 'OTP Sent',
          description: `OTP sent to your WhatsApp number ${mobileNumber}`,
        });
      } else {
        const dummyOtp = '123456';
        setOtp(dummyOtp);
        setStep('otp');
        toast({
          title: 'OTP Sent',
          description: `Enter OTP to continue. Development OTP: ${dummyOtp}`,
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send OTP',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (loginMethod === 'mobile') {
        await verifyOTP(mobileNumber, otpInput);
        toast({
          title: 'Login successful',
          description: 'Welcome back!',
        });
        setLocation('/');
      } else {
        if (otpInput !== otp) {
          throw new Error('Invalid OTP');
        }
        await login(email, password);
        toast({
          title: 'Login successful',
          description: 'Welcome back!',
        });
        setLocation('/');
      }
    } catch (error: any) {
      toast({
        title: 'Verification failed',
        description: error.message || 'Invalid OTP',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md" data-testid="card-login">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <img src={logoImage} alt="Mauli Car World Logo" className="h-8 w-auto" />
              <CardTitle data-testid="text-title">Mauli Car World</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/select-role')}
              data-testid="button-back"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </div>
          <CardDescription data-testid="text-description">
            {selectedRole ? `Sign in as ${selectedRole}` : 'Sign in to access your dashboard'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'credentials' ? (
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <div className="flex gap-2 mb-4">
                <Button
                  type="button"
                  variant={loginMethod === 'email' ? 'default' : 'outline'}
                  onClick={() => setLoginMethod('email')}
                  className="flex-1"
                  data-testid="button-email-method"
                >
                  Email Login
                </Button>
                <Button
                  type="button"
                  variant={loginMethod === 'mobile' ? 'default' : 'outline'}
                  onClick={() => setLoginMethod('mobile')}
                  className="flex-1"
                  data-testid="button-mobile-method"
                >
                  Mobile OTP
                </Button>
              </div>
              
              {loginMethod === 'email' ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email" data-testid="label-email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@maulicarworld.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      data-testid="input-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" data-testid="label-password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      data-testid="input-password"
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="mobile" data-testid="label-mobile">Mobile Number</Label>
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="9876543210"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    required
                    data-testid="input-mobile"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter your 10-digit mobile number registered with your role
                  </p>
                </div>
              )}
              
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                data-testid="button-login"
              >
                {isLoading ? 'Sending OTP...' : 'Continue'}
              </Button>
              <p className="text-sm text-center text-muted-foreground" data-testid="text-info">
                Contact your administrator for account access
              </p>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp" data-testid="label-otp">Enter OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  className="text-center text-2xl tracking-widest"
                  required
                  data-testid="input-otp-login"
                />
                <p className="text-sm text-center text-muted-foreground" data-testid="text-otp-info">
                  {loginMethod === 'mobile' 
                    ? `OTP sent to your WhatsApp number ${mobileNumber}`
                    : 'Check your email for OTP (Development mode)'}
                </p>
                {otp && loginMethod === 'email' && (
                  <p className="text-sm text-center bg-yellow-100 dark:bg-yellow-900 p-2 rounded" data-testid="text-dev-otp">
                    Development OTP: {otp}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setStep('credentials');
                    setOtpInput('');
                    setOtp('');
                  }}
                  className="w-full"
                  data-testid="button-back-to-credentials"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || otpInput.length !== 6}
                  data-testid="button-verify-otp"
                >
                  {isLoading ? 'Verifying...' : 'Verify & Sign In'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
