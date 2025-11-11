import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Crown, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

interface UpgradePromptProps {
  reason: 'pages' | 'signups' | 'file_size' | 'feature';
  currentPlan?: string;
  feature?: string;
  variant?: 'card' | 'alert' | 'inline';
}

export function UpgradePrompt({ reason, currentPlan = 'Free', feature, variant = 'card' }: UpgradePromptProps) {
  const messages = {
    pages: {
      title: 'Upgrade to create unlimited pages',
      description: `You've reached the limit of 1 page on the ${currentPlan} plan. Upgrade to Pro for unlimited pages and more signups.`,
      icon: Sparkles,
    },
    signups: {
      title: 'Upgrade for more signups',
      description: `You're approaching your monthly signup limit. Upgrade to Pro for 1,000 signups/month or Business for 10,000/month.`,
      icon: TrendingUp,
    },
    file_size: {
      title: 'Upgrade for larger file uploads',
      description: `This file exceeds the ${currentPlan} plan limit. Upgrade to Pro (50MB) or Business (100MB) for larger files.`,
      icon: Zap,
    },
    feature: {
      title: `${feature} is a Pro feature`,
      description: `Unlock ${feature} and more with ShareKit Pro. Just $19/month for unlimited pages, advanced analytics, and AI-powered tools.`,
      icon: Crown,
    },
  };

  const message = messages[reason];
  const Icon = message.icon;

  if (variant === 'alert') {
    return (
      <Alert className="border-2 border-amber-200 bg-amber-50">
        <Icon className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-900">{message.title}</AlertTitle>
        <AlertDescription className="text-amber-800">
          {message.description}
          <Button asChild size="sm" className="mt-3 bg-gradient-ocean hover:opacity-90">
            <Link to="/pricing">Upgrade to Pro</Link>
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-amber-600" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-amber-900 mb-1">{message.title}</h4>
          <p className="text-sm text-amber-800 mb-3">{message.description}</p>
          <Button asChild size="sm" className="bg-gradient-ocean hover:opacity-90">
            <Link to="/pricing">Upgrade Now</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Default: card variant
  return (
    <Card className="border-2 border-primary shadow-large bg-gradient-to-br from-cyan-50 to-blue-50">
      <CardHeader className="text-center pb-4">
        <div className="w-16 h-16 rounded-full bg-gradient-ocean flex items-center justify-center mx-auto mb-4">
          <Icon className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl">{message.title}</CardTitle>
        <CardDescription className="text-base">{message.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white rounded-lg p-4 border border-cyan-200">
          <h4 className="font-semibold text-slate-900 mb-2">Pro Plan - $19/month</h4>
          <ul className="text-sm text-slate-700 space-y-1">
            <li>✓ Unlimited pages</li>
            <li>✓ 1,000 signups/month</li>
            <li>✓ Remove ShareKit branding</li>
            <li>✓ Advanced analytics</li>
            <li>✓ AI-powered tools</li>
          </ul>
        </div>
        <Button asChild className="w-full bg-gradient-ocean hover:opacity-90" size="lg">
          <Link to="/pricing">Upgrade to Pro</Link>
        </Button>
        <p className="text-xs text-center text-slate-600">
          No credit card required to start. 7-day free trial.
        </p>
      </CardContent>
    </Card>
  );
}

interface UsageWarningProps {
  type: 'pages' | 'signups';
  current: number;
  limit: number;
  percentage: number;
}

export function UsageWarning({ type, current, limit, percentage }: UsageWarningProps) {
  if (percentage < 80) return null;

  const isNearLimit = percentage >= 80 && percentage < 100;
  const isAtLimit = percentage >= 100;

  const color = isAtLimit ? 'red' : 'amber';

  return (
    <Alert className={`border-2 border-${color}-200 bg-${color}-50`}>
      <TrendingUp className={`h-4 w-4 text-${color}-600`} />
      <AlertTitle className={`text-${color}-900`}>
        {isAtLimit ? `${type === 'pages' ? 'Page' : 'Signup'} limit reached` : `Approaching ${type} limit`}
      </AlertTitle>
      <AlertDescription className={`text-${color}-800`}>
        You've used <strong>{current}</strong> of <strong>{limit}</strong> {type} this month ({percentage}%).
        {isAtLimit ? ' Upgrade to continue.' : ' Consider upgrading to avoid interruptions.'}
        {!isAtLimit && (
          <Button asChild size="sm" variant="outline" className="mt-2 ml-2">
            <Link to="/pricing">View Plans</Link>
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
