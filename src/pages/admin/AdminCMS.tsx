import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  FileEdit,
  Plus,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  BookOpen,
  FileText,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  published_at: string | null;
  view_count: number;
  tags: string[];
  category: string;
  created_at: string;
  updated_at: string;
}

interface HelpArticle {
  id: string;
  category: string;
  title: string;
  slug: string;
  content: string;
  status: 'draft' | 'published' | 'archived';
  order_index: number;
  helpful_count: number;
  not_helpful_count: number;
  view_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export default function AdminCMS() {
  const { hasPermission, logActivity, adminUser } = useAdmin();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('blog');
  const [isLoading, setIsLoading] = useState(true);

  // Blog state
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [selectedBlogPost, setSelectedBlogPost] = useState<BlogPost | null>(null);
  const [showBlogDialog, setShowBlogDialog] = useState(false);
  const [blogFormData, setBlogFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: '',
    tags: '',
    status: 'draft',
  });

  // Help articles state
  const [helpArticles, setHelpArticles] = useState<HelpArticle[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);
  const [showArticleDialog, setShowArticleDialog] = useState(false);
  const [articleFormData, setArticleFormData] = useState({
    category: '',
    title: '',
    slug: '',
    content: '',
    status: 'draft',
  });

  const helpCategories = [
    'Getting Started',
    'Resource Management',
    'Page Builder',
    'Email Delivery',
    'Analytics',
    'Billing & Plans',
    'Troubleshooting',
    'API Documentation',
  ];

  useEffect(() => {
    loadContent();
    logActivity('page_view', 'admin_cms');
  }, []);

  async function loadContent() {
    try {
      setIsLoading(true);

      const [blogResult, articlesResult] = await Promise.all([
        supabase.from('blog_posts').select('*').order('created_at', { ascending: false }),
        supabase.from('help_articles').select('*').order('category, order_index'),
      ]);

      if (blogResult.error) throw blogResult.error;
      if (articlesResult.error) throw articlesResult.error;

      setBlogPosts(blogResult.data || []);
      setHelpArticles(articlesResult.data || []);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading content:', error);
      toast({
        title: 'Error',
        description: 'Failed to load content',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  }

  // Blog functions
  function handleNewBlogPost() {
    setBlogFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      category: '',
      tags: '',
      status: 'draft',
    });
    setSelectedBlogPost(null);
    setShowBlogDialog(true);
  }

  function handleEditBlogPost(post: BlogPost) {
    setBlogFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      tags: post.tags.join(', '),
      status: post.status,
    });
    setSelectedBlogPost(post);
    setShowBlogDialog(true);
  }

  async function handleSaveBlogPost() {
    if (!blogFormData.title || !blogFormData.content) {
      toast({
        title: 'Validation Error',
        description: 'Title and content are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      const slug = blogFormData.slug || blogFormData.title.toLowerCase().replace(/\s+/g, '-');
      const tags = blogFormData.tags
        ? blogFormData.tags.split(',').map((t) => t.trim())
        : [];

      const postData = {
        title: blogFormData.title,
        slug,
        excerpt: blogFormData.excerpt,
        content: blogFormData.content,
        category: blogFormData.category,
        tags,
        status: blogFormData.status,
        author_id: adminUser?.id,
        published_at:
          blogFormData.status === 'published' && !selectedBlogPost?.published_at
            ? new Date().toISOString()
            : selectedBlogPost?.published_at,
      };

      if (selectedBlogPost) {
        // Update existing
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', selectedBlogPost.id);

        if (error) throw error;

        toast({
          title: 'Blog Post Updated',
          description: 'The blog post has been updated successfully',
        });

        logActivity('update_blog_post', 'blog_post', selectedBlogPost.id);
      } else {
        // Create new
        const { error } = await supabase.from('blog_posts').insert(postData);

        if (error) throw error;

        toast({
          title: 'Blog Post Created',
          description: 'The blog post has been created successfully',
        });

        logActivity('create_blog_post', 'blog_post');
      }

      setShowBlogDialog(false);
      loadContent();
    } catch (error) {
      console.error('Error saving blog post:', error);
      toast({
        title: 'Error',
        description: 'Failed to save blog post',
        variant: 'destructive',
      });
    }
  }

  async function handleDeleteBlogPost(post: BlogPost) {
    if (!confirm('Are you sure you want to delete this blog post?')) return;

    try {
      const { error } = await supabase.from('blog_posts').delete().eq('id', post.id);

      if (error) throw error;

      toast({
        title: 'Blog Post Deleted',
        description: 'The blog post has been deleted',
      });

      logActivity('delete_blog_post', 'blog_post', post.id);
      loadContent();
    } catch (error) {
      console.error('Error deleting blog post:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete blog post',
        variant: 'destructive',
      });
    }
  }

  // Help article functions
  function handleNewArticle() {
    setArticleFormData({
      category: helpCategories[0],
      title: '',
      slug: '',
      content: '',
      status: 'draft',
    });
    setSelectedArticle(null);
    setShowArticleDialog(true);
  }

  function handleEditArticle(article: HelpArticle) {
    setArticleFormData({
      category: article.category,
      title: article.title,
      slug: article.slug,
      content: article.content,
      status: article.status,
    });
    setSelectedArticle(article);
    setShowArticleDialog(true);
  }

  async function handleSaveArticle() {
    if (!articleFormData.title || !articleFormData.content) {
      toast({
        title: 'Validation Error',
        description: 'Title and content are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      const slug =
        articleFormData.slug || articleFormData.title.toLowerCase().replace(/\s+/g, '-');

      const articleData = {
        category: articleFormData.category,
        title: articleFormData.title,
        slug,
        content: articleFormData.content,
        status: articleFormData.status,
        author_id: adminUser?.id,
        published_at:
          articleFormData.status === 'published' && !selectedArticle?.published_at
            ? new Date().toISOString()
            : selectedArticle?.published_at,
      };

      if (selectedArticle) {
        // Update existing
        const { error } = await supabase
          .from('help_articles')
          .update(articleData)
          .eq('id', selectedArticle.id);

        if (error) throw error;

        toast({
          title: 'Article Updated',
          description: 'The help article has been updated successfully',
        });

        logActivity('update_help_article', 'help_article', selectedArticle.id);
      } else {
        // Create new
        const { error } = await supabase.from('help_articles').insert(articleData);

        if (error) throw error;

        toast({
          title: 'Article Created',
          description: 'The help article has been created successfully',
        });

        logActivity('create_help_article', 'help_article');
      }

      setShowArticleDialog(false);
      loadContent();
    } catch (error) {
      console.error('Error saving help article:', error);
      toast({
        title: 'Error',
        description: 'Failed to save help article',
        variant: 'destructive',
      });
    }
  }

  async function handleDeleteArticle(article: HelpArticle) {
    if (!confirm('Are you sure you want to delete this help article?')) return;

    try {
      const { error } = await supabase.from('help_articles').delete().eq('id', article.id);

      if (error) throw error;

      toast({
        title: 'Article Deleted',
        description: 'The help article has been deleted',
      });

      logActivity('delete_help_article', 'help_article', article.id);
      loadContent();
    } catch (error) {
      console.error('Error deleting help article:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete help article',
        variant: 'destructive',
      });
    }
  }

  function formatDate(dateString: string | null): string {
    if (!dateString) return 'Not published';
    return new Date(dateString).toLocaleDateString();
  }

  if (!hasPermission('cms.view')) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">You don't have permission to view CMS.</p>
        </div>
      </AdminLayout>
    );
  }

  const publishedBlogCount = blogPosts.filter((p) => p.status === 'published').length;
  const draftBlogCount = blogPosts.filter((p) => p.status === 'draft').length;
  const publishedArticleCount = helpArticles.filter((a) => a.status === 'published').length;
  const draftArticleCount = helpArticles.filter((a) => a.status === 'draft').length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Content Management</h1>
            <p className="text-gray-500 mt-1">Manage blog posts and help articles</p>
          </div>
          <Button onClick={loadContent} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Blog Posts</p>
                  <p className="text-2xl font-bold">{blogPosts.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {publishedBlogCount} published, {draftBlogCount} drafts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Help Articles</p>
                  <p className="text-2xl font-bold">{helpArticles.length}</p>
                </div>
                <BookOpen className="h-8 w-8 text-purple-600" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {publishedArticleCount} published, {draftArticleCount} drafts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Views</p>
                  <p className="text-2xl font-bold">
                    {blogPosts.reduce((acc, p) => acc + p.view_count, 0) +
                      helpArticles.reduce((acc, a) => acc + a.view_count, 0)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-xs text-gray-500 mt-2">All content combined</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Categories</p>
                  <p className="text-2xl font-bold">{helpCategories.length}</p>
                </div>
                <FileEdit className="h-8 w-8 text-orange-600" />
              </div>
              <p className="text-xs text-gray-500 mt-2">Help center categories</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="blog">
              <FileText className="h-4 w-4 mr-2" />
              Blog Posts
            </TabsTrigger>
            <TabsTrigger value="help">
              <BookOpen className="h-4 w-4 mr-2" />
              Help Articles
            </TabsTrigger>
          </TabsList>

          {/* Blog Posts Tab */}
          <TabsContent value="blog" className="space-y-4 mt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Blog Posts</h2>
              {hasPermission('cms.edit') && (
                <Button onClick={handleNewBlogPost}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Blog Post
                </Button>
              )}
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : blogPosts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No blog posts yet</p>
                  {hasPermission('cms.edit') && (
                    <Button onClick={handleNewBlogPost} className="mt-4">
                      Create Your First Post
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Views</TableHead>
                        <TableHead>Published</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {blogPosts.map((post) => (
                        <TableRow key={post.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{post.title}</p>
                              {post.excerpt && (
                                <p className="text-sm text-gray-500 line-clamp-1">
                                  {post.excerpt}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{post.category || 'Uncategorized'}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                post.status === 'published'
                                  ? 'default'
                                  : post.status === 'draft'
                                  ? 'secondary'
                                  : 'outline'
                              }
                              className="capitalize"
                            >
                              {post.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{post.view_count}</TableCell>
                          <TableCell className="text-sm">
                            {formatDate(post.published_at)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {hasPermission('cms.edit') && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditBlogPost(post)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteBlogPost(post)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Help Articles Tab */}
          <TabsContent value="help" className="space-y-4 mt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Help Articles</h2>
              {hasPermission('cms.edit') && (
                <Button onClick={handleNewArticle}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Help Article
                </Button>
              )}
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {helpCategories.map((category) => {
                  const categoryArticles = helpArticles.filter(
                    (a) => a.category === category
                  );

                  if (categoryArticles.length === 0 && !hasPermission('cms.edit')) {
                    return null;
                  }

                  return (
                    <Card key={category}>
                      <CardHeader>
                        <CardTitle className="text-lg">{category}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {categoryArticles.length === 0 ? (
                          <p className="text-sm text-gray-500">No articles in this category</p>
                        ) : (
                          <div className="space-y-2">
                            {categoryArticles.map((article) => (
                              <div
                                key={article.id}
                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium">{article.title}</p>
                                    <Badge
                                      variant={
                                        article.status === 'published' ? 'default' : 'secondary'
                                      }
                                      className="text-xs"
                                    >
                                      {article.status}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                                    <span>{article.view_count} views</span>
                                    <span>
                                      {article.helpful_count} helpful • {article.not_helpful_count}{' '}
                                      not helpful
                                    </span>
                                  </div>
                                </div>
                                {hasPermission('cms.edit') && (
                                  <div className="flex gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditArticle(article)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteArticle(article)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Blog Post Dialog */}
        <Dialog open={showBlogDialog} onOpenChange={setShowBlogDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>
                {selectedBlogPost ? 'Edit Blog Post' : 'New Blog Post'}
              </DialogTitle>
              <DialogDescription>
                Create and manage blog content for your platform
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[calc(90vh-200px)]">
              <div className="space-y-4 pr-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Title *</label>
                  <Input
                    value={blogFormData.title}
                    onChange={(e) =>
                      setBlogFormData({ ...blogFormData, title: e.target.value })
                    }
                    placeholder="Enter blog post title..."
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Slug</label>
                  <Input
                    value={blogFormData.slug}
                    onChange={(e) => setBlogFormData({ ...blogFormData, slug: e.target.value })}
                    placeholder="auto-generated-from-title"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave blank to auto-generate from title
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Excerpt</label>
                  <Textarea
                    value={blogFormData.excerpt}
                    onChange={(e) =>
                      setBlogFormData({ ...blogFormData, excerpt: e.target.value })
                    }
                    placeholder="Brief description..."
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    <Input
                      value={blogFormData.category}
                      onChange={(e) =>
                        setBlogFormData({ ...blogFormData, category: e.target.value })
                      }
                      placeholder="Product Updates, Tips, etc."
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Tags</label>
                    <Input
                      value={blogFormData.tags}
                      onChange={(e) =>
                        setBlogFormData({ ...blogFormData, tags: e.target.value })
                      }
                      placeholder="tag1, tag2, tag3"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Content *</label>
                  <Textarea
                    value={blogFormData.content}
                    onChange={(e) =>
                      setBlogFormData({ ...blogFormData, content: e.target.value })
                    }
                    placeholder="Write your blog post content here (Markdown supported)..."
                    rows={12}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select
                    value={blogFormData.status}
                    onValueChange={(value) =>
                      setBlogFormData({ ...blogFormData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBlogDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveBlogPost}>
                {selectedBlogPost ? 'Update' : 'Create'} Post
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Help Article Dialog */}
        <Dialog open={showArticleDialog} onOpenChange={setShowArticleDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>
                {selectedArticle ? 'Edit Help Article' : 'New Help Article'}
              </DialogTitle>
              <DialogDescription>
                Create and manage help center documentation
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[calc(90vh-200px)]">
              <div className="space-y-4 pr-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Category *</label>
                  <Select
                    value={articleFormData.category}
                    onValueChange={(value) =>
                      setArticleFormData({ ...articleFormData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {helpCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Title *</label>
                  <Input
                    value={articleFormData.title}
                    onChange={(e) =>
                      setArticleFormData({ ...articleFormData, title: e.target.value })
                    }
                    placeholder="Enter article title..."
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Slug</label>
                  <Input
                    value={articleFormData.slug}
                    onChange={(e) =>
                      setArticleFormData({ ...articleFormData, slug: e.target.value })
                    }
                    placeholder="auto-generated-from-title"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave blank to auto-generate from title
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Content *</label>
                  <Textarea
                    value={articleFormData.content}
                    onChange={(e) =>
                      setArticleFormData({ ...articleFormData, content: e.target.value })
                    }
                    placeholder="Write your help article content here (Markdown supported)..."
                    rows={12}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select
                    value={articleFormData.status}
                    onValueChange={(value) =>
                      setArticleFormData({ ...articleFormData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowArticleDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveArticle}>
                {selectedArticle ? 'Update' : 'Create'} Article
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
