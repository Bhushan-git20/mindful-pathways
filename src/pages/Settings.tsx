import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppHeader from '@/components/layout/AppHeader';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Palette, 
  Globe, 
  Download, 
  Trash2, 
  Loader2,
  FileJson,
  FileSpreadsheet,
  Shield,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface UserPreferences {
  weeklyReminder: boolean;
  personalizedInsights: boolean;
  crisisAlerts: boolean;
  theme: 'light' | 'dark' | 'system';
  language: string;
}

export default function Settings() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState<UserPreferences>({
    weeklyReminder: true,
    personalizedInsights: true,
    crisisAlerts: true,
    theme: 'light',
    language: 'en',
  });
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Load preferences from localStorage
  useEffect(() => {
    const savedPrefs = localStorage.getItem('mindmate-preferences');
    if (savedPrefs) {
      setPreferences(JSON.parse(savedPrefs));
    }
  }, []);

  const savePreferences = () => {
    setSaving(true);
    localStorage.setItem('mindmate-preferences', JSON.stringify(preferences));
    setTimeout(() => {
      setSaving(false);
      toast.success('Preferences saved successfully!');
    }, 500);
  };

  const exportData = async (format: 'json' | 'csv') => {
    if (!user) return;
    setExporting(true);

    try {
      // Fetch all user data
      const [assessmentsRes, journalsRes, messagesRes] = await Promise.all([
        supabase.from('assessments').select('*').eq('user_id', user.id),
        supabase.from('journal_entries').select('*').eq('user_id', user.id),
        supabase.from('chat_messages').select('*').eq('user_id', user.id),
      ]);

      const exportData = {
        exportDate: new Date().toISOString(),
        user: {
          id: user.id,
          email: user.email,
        },
        assessments: assessmentsRes.data || [],
        journalEntries: journalsRes.data || [],
        chatMessages: messagesRes.data || [],
      };

      let content: string;
      let filename: string;
      let mimeType: string;

      if (format === 'json') {
        content = JSON.stringify(exportData, null, 2);
        filename = `mindmate-export-${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
      } else {
        // CSV format - flatten assessments
        const rows = [
          ['Type', 'Date', 'Score', 'Severity', 'Data Type'],
          ...(exportData.assessments.map(a => [
            a.assessment_type,
            a.completed_at,
            a.total_score.toString(),
            a.severity,
            'Assessment'
          ])),
          ...(exportData.journalEntries.map(j => [
            'Journal',
            j.created_at,
            j.risk_level || 'N/A',
            (j.mood_tags || []).join('; '),
            'Journal Entry'
          ])),
        ];
        content = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        filename = `mindmate-export-${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
      }

      // Download file
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`Data exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setDeleting(true);

    try {
      await supabase.from('chat_messages').delete().eq('user_id', user.id);
      await supabase.from('assessments').delete().eq('user_id', user.id);
      await supabase.from('journal_entries').delete().eq('user_id', user.id);
      await supabase.from('risk_scores').delete().eq('user_id', user.id);
      await supabase.from('profiles').delete().eq('user_id', user.id);
      await supabase.from('user_roles').delete().eq('user_id', user.id);

      localStorage.removeItem('mindmate-preferences');
      await signOut();
      toast.success('Your account data has been deleted.');
      navigate('/');
    } catch (error) {
      toast.error('Failed to delete account data');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container py-8 max-w-2xl">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <SettingsIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display text-foreground">Settings</h1>
              <p className="text-sm text-muted-foreground">
                Manage your preferences and account
              </p>
            </div>
          </div>
        </div>

        {/* Wellness Monitoring */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle>Wellness Monitoring</CardTitle>
            </div>
            <CardDescription>Configure notifications and monitoring preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="font-medium">Weekly Assessment Reminder</Label>
                <p className="text-sm text-muted-foreground">
                  Receive reminders to complete your weekly check-in
                </p>
              </div>
              <Switch
                checked={preferences.weeklyReminder}
                onCheckedChange={(checked) => setPreferences({ ...preferences, weeklyReminder: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="font-medium">Personalized Insights</Label>
                <p className="text-sm text-muted-foreground">
                  Allow AI analysis for personalized recommendations
                </p>
              </div>
              <Switch
                checked={preferences.personalizedInsights}
                onCheckedChange={(checked) => setPreferences({ ...preferences, personalizedInsights: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="font-medium">Crisis Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Show immediate notifications if high risk is detected
                </p>
              </div>
              <Switch
                checked={preferences.crisisAlerts}
                onCheckedChange={(checked) => setPreferences({ ...preferences, crisisAlerts: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* App Preferences */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-secondary" />
              <CardTitle>App Preferences</CardTitle>
            </div>
            <CardDescription>Customize your app experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="font-medium flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Language
                </Label>
                <p className="text-sm text-muted-foreground">
                  Select your preferred language
                </p>
              </div>
              <Select
                value={preferences.language}
                onValueChange={(value) => setPreferences({ ...preferences, language: value })}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="pt">Português</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="font-medium flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Theme
                </Label>
                <p className="text-sm text-muted-foreground">
                  Choose your color scheme
                </p>
              </div>
              <Select
                value={preferences.theme}
                onValueChange={(value: 'light' | 'dark' | 'system') => setPreferences({ ...preferences, theme: value })}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end mb-8">
          <Button onClick={savePreferences} disabled={saving} className="gap-2">
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            Save Preferences
          </Button>
        </div>

        {/* Data & Account */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-info" />
              <CardTitle>Data Export</CardTitle>
            </div>
            <CardDescription>Download your personal data</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Export all your assessments, journal entries, and chat history.
            </p>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => exportData('json')}
                disabled={exporting}
                className="gap-2"
              >
                <FileJson className="h-4 w-4" />
                Export as JSON
              </Button>
              <Button 
                variant="outline" 
                onClick={() => exportData('csv')}
                disabled={exporting}
                className="gap-2"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Export as CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Link */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-success" />
              <CardTitle>Privacy & Consent</CardTitle>
            </div>
            <CardDescription>Manage your data privacy settings</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => navigate('/profile')} className="gap-2">
              Go to Profile Settings
            </Button>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>Irreversible account actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Delete Account Data</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete all your data including assessments, journals, and profile
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Delete Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete all your data
                      including assessments, journal entries, chat history, and profile information.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      disabled={deleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {deleting ? 'Deleting...' : 'Yes, delete my data'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
