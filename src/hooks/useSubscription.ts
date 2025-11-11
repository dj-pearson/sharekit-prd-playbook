import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PlanLimits {
  pages: number;
  signups_per_month: number;
  file_size_mb: number;
  custom_domain: boolean;
  remove_branding: boolean;
  ai_features: boolean;
  analytics_advanced: boolean;
}

export interface Subscription {
  plan: 'free' | 'pro' | 'business';
  limits: PlanLimits;
  usage: {
    pages: number;
    signups_this_month: number;
  };
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  current_period_end?: Date;
}

const PLAN_LIMITS: Record<'free' | 'pro' | 'business', PlanLimits> = {
  free: {
    pages: 1,
    signups_per_month: 100,
    file_size_mb: 10,
    custom_domain: false,
    remove_branding: false,
    ai_features: false,
    analytics_advanced: false,
  },
  pro: {
    pages: Infinity,
    signups_per_month: 1000,
    file_size_mb: 50,
    custom_domain: false,
    remove_branding: true,
    ai_features: true,
    analytics_advanced: true,
  },
  business: {
    pages: Infinity,
    signups_per_month: 10000,
    file_size_mb: 100,
    custom_domain: true,
    remove_branding: true,
    ai_features: true,
    analytics_advanced: true,
  },
};

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Get subscription from profiles (default to free)
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_plan, stripe_customer_id, stripe_subscription_id')
        .eq('id', user.id)
        .single();

      const plan = (profile?.subscription_plan as 'free' | 'pro' | 'business') || 'free';

      // Get usage stats
      const { count: pageCount } = await supabase
        .from('pages')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get signups this month
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: userPages } = await supabase
        .from('pages')
        .select('id')
        .eq('user_id', user.id);

      const pageIds = userPages?.map(p => p.id) || [];

      let signupsThisMonth = 0;
      if (pageIds.length > 0) {
        const { count } = await supabase
          .from('email_captures')
          .select('*', { count: 'exact', head: true })
          .in('page_id', pageIds)
          .gte('captured_at', thirtyDaysAgo.toISOString());

        signupsThisMonth = count || 0;
      }

      setSubscription({
        plan,
        limits: PLAN_LIMITS[plan],
        usage: {
          pages: pageCount || 0,
          signups_this_month: signupsThisMonth,
        },
        stripe_customer_id: profile?.stripe_customer_id || undefined,
        stripe_subscription_id: profile?.stripe_subscription_id || undefined,
      });
    } catch (err) {
      setError(err as Error);
      console.error('Error loading subscription:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const canCreatePage = () => {
    if (!subscription) return false;
    return subscription.usage.pages < subscription.limits.pages;
  };

  const canReceiveSignup = () => {
    if (!subscription) return false;
    return subscription.usage.signups_this_month < subscription.limits.signups_per_month;
  };

  const canUploadFile = (fileSizeMB: number) => {
    if (!subscription) return false;
    return fileSizeMB <= subscription.limits.file_size_mb;
  };

  const hasFeature = (feature: keyof PlanLimits) => {
    if (!subscription) return false;
    return subscription.limits[feature] === true;
  };

  const getPlanName = () => {
    if (!subscription) return 'Free';
    return subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1);
  };

  const refresh = () => {
    loadSubscription();
  };

  return {
    subscription,
    isLoading,
    error,
    canCreatePage,
    canReceiveSignup,
    canUploadFile,
    hasFeature,
    getPlanName,
    refresh,
  };
}
