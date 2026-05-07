"use client"
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { User, TreeDeciduous, LogOut, Loader2, Link as LinkIcon, Plus } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function DashboardPage() {
  const [session, setSession] = useState<any>(null);
  const [trees, setTrees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrees = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('family_trees')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setTrees(data || []);
    } catch (error: any) {
      toast.error('Failed to load trees: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchTrees(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchTrees(session.user.id);
      else setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleCreateTree = async () => {
    if (!session?.user?.id) return;
    try {
      const name = prompt('Enter Family Tree Name:');
      if (!name) return;

      const { data: tree, error: treeError } = await supabase
        .from('family_trees')
        .insert({ owner_id: session.user.id, name })
        .select()
        .single();

      if (treeError) throw treeError;
      
      // Auto-create a root person
      const { error: rootError } = await supabase
        .from('persons')
        .insert({
          tree_id: tree.id,
          first_name: 'Root',
          last_name: 'Person',
          gender: 'unknown'
        });
        
      if (rootError) throw rootError;

      fetchTrees(session.user.id);
      toast.success('Tree created successfully!');
    } catch (error: any) {
      toast.error('Failed to create tree: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f2ed]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f2ed] p-4 text-center">
        <TreeDeciduous className="w-16 h-16 text-primary mb-6" />
        <h1 className="text-4xl font-semibold font-serif mb-2 tracking-tight">Family Tree Maker</h1>
        <p className="text-muted-foreground max-w-md mb-8">
          A modern, interactive way to trace your ancestry and build your family legacy.
        </p>
        <Button size="lg" onClick={handleLogin} className="gap-2 rounded-full px-8">
          <User className="w-4 h-4" />
          Continue with Google
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f2ed] p-6 lg:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TreeDeciduous className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-serif font-semibold tracking-tight">My Family Trees</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">{session.user.email}</span>
            <Button variant="outline" size="sm" onClick={() => supabase.auth.signOut()}>
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="flex flex-col items-center justify-center p-6 border-dashed border-2 hover:border-primary/50 hover:bg-black/5 cursor-pointer transition-colors" onClick={handleCreateTree}>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Plus className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-medium">Create New Tree</h3>
          </Card>

          {trees.map((tree) => (
            <Card key={tree.id} className="flex flex-col hover:shadow-md transition-shadow">
              <CardHeader className="flex-1">
                <CardTitle className="font-serif truncate">{tree.name}</CardTitle>
                <CardDescription>
                  Updated {new Date(tree.updated_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-2 pt-0 mt-auto">
                <Link href={`/tree/${tree.id}`} className="flex-1">
                  <Button className="w-full" variant="secondary">Open Tree</Button>
                </Link>
                <Button variant="outline" size="icon" title="Copy Public Link" onClick={() => {
                  const url = `${window.location.origin}/share/${tree.share_token}`;
                  navigator.clipboard.writeText(url);
                  toast.success('Share link copied to clipboard!');
                }}>
                  <LinkIcon className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
