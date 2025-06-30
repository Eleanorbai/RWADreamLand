import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Separator } from '../components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { 
  Heart, 
  Eye, 
  MessageCircle, 
  Calendar, 
  User, 
  Plus, 
  Search, 
  Filter,
  TrendingUp,
  Clock,
  MoreVertical,
  BookOpen,
  Users,
  Star
} from 'lucide-react';
import { contentApi, tagApi } from '../lib/api';
import { Content, ContentType, Tag } from '../types';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Square: React.FC = () => {
  const [contents, setContents] = useState<Content[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ContentType | 'all'>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'trending'>('latest');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, [selectedType, sortBy]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // 加载内容列表
      const contentType = selectedType === 'all' ? undefined : selectedType;
      const contentData = await contentApi.getContents(0, 50, contentType);
      setContents(contentData);

      // 加载标签列表
      const tagData = await tagApi.getTags(0, 100);
      setTags(tagData);
    } catch (error) {
      console.error('加载数据失败:', error);
      toast.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (contentId: number) => {
    try {
      const result = await contentApi.toggleLike(contentId);
      
      // 更新本地数据
      setContents(prev => prev.map(content => 
        content.id === contentId 
          ? { 
              ...content, 
              like_count: result.liked ? content.like_count + 1 : content.like_count - 1 
            }
          : content
      ));
      
      toast.success(result.message);
    } catch (error) {
      console.error('点赞失败:', error);
      toast.error('点赞失败');
    }
  };

  const handleContentView = (contentId: number) => {
    navigate(`/content/${contentId}`);
  };

  const getContentTypeLabel = (type: ContentType) => {
    const labels = {
      [ContentType.CASE_STUDY]: '案例研究',
      [ContentType.STUDY_NOTES]: '学习笔记',
      [ContentType.BUSINESS_MODEL]: '商业模型'
    };
    return labels[type] || type;
  };

  const getContentTypeColor = (type: ContentType) => {
    const colors = {
      [ContentType.CASE_STUDY]: 'bg-blue-100 text-blue-800',
      [ContentType.STUDY_NOTES]: 'bg-green-100 text-green-800',
      [ContentType.BUSINESS_MODEL]: 'bg-purple-100 text-purple-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getContentTypeIcon = (type: ContentType) => {
    const icons = {
      [ContentType.CASE_STUDY]: BookOpen,
      [ContentType.STUDY_NOTES]: User,
      [ContentType.BUSINESS_MODEL]: Users
    };
    return icons[type] || BookOpen;
  };

  const filteredContents = contents.filter(content => {
    const matchesSearch = !searchQuery || 
      content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTag = selectedTag === 'all' || 
      content.tags?.some(tag => tag.id.toString() === selectedTag);
    
    return matchesSearch && matchesTag;
  });

  const sortedContents = [...filteredContents].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return (b.like_count + b.view_count) - (a.like_count + a.view_count);
      case 'trending':
        // 简单的热度算法：最近的内容加权更高
        const aScore = a.like_count + a.view_count + (new Date(a.created_at).getTime() / 1000000);
        const bScore = b.like_count + b.view_count + (new Date(b.created_at).getTime() / 1000000);
        return bScore - aScore;
      case 'latest':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 页面头部 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-3xl font-bold text-blue-800 mb-2">灵感广场</h1>
          <p className="text-gray-600">发现和分享RWA领域的精彩内容</p>
        </div>
        <Button 
          onClick={() => navigate('/notes')} 
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          发布内容
        </Button>
      </div>

      {/* 搜索和筛选区域 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="搜索内容标题或描述..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* 内容类型筛选 */}
          <Select value={selectedType} onValueChange={(value) => setSelectedType(value as ContentType | 'all')}>
            <SelectTrigger>
              <SelectValue placeholder="选择内容类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部类型</SelectItem>
              <SelectItem value={ContentType.CASE_STUDY}>案例研究</SelectItem>
              <SelectItem value={ContentType.STUDY_NOTES}>学习笔记</SelectItem>
              <SelectItem value={ContentType.BUSINESS_MODEL}>商业模型</SelectItem>
            </SelectContent>
          </Select>

          {/* 标签筛选 */}
          <Select value={selectedTag} onValueChange={setSelectedTag}>
            <SelectTrigger>
              <SelectValue placeholder="选择标签" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部标签</SelectItem>
              {tags.map(tag => (
                <SelectItem key={tag.id} value={tag.id.toString()}>
                  {tag.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 排序方式 */}
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'latest' | 'popular' | 'trending')}>
            <SelectTrigger>
              <SelectValue placeholder="排序方式" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  最新发布
                </div>
              </SelectItem>
              <SelectItem value="popular">
                <div className="flex items-center">
                  <Heart className="w-4 h-4 mr-2" />
                  最受欢迎
                </div>
              </SelectItem>
              <SelectItem value="trending">
                <div className="flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  热门趋势
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">总内容数</p>
                <p className="text-2xl font-bold text-gray-900">{contents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">总浏览量</p>
                <p className="text-2xl font-bold text-gray-900">
                  {contents.reduce((sum, content) => sum + content.view_count, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">总点赞数</p>
                <p className="text-2xl font-bold text-gray-900">
                  {contents.reduce((sum, content) => sum + content.like_count, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">精选内容</p>
                <p className="text-2xl font-bold text-gray-900">
                  {contents.filter(content => content.like_count > 10).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 内容列表 */}
      {sortedContents.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <BookOpen className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无内容</h3>
          <p className="text-gray-500 mb-4">还没有符合条件的内容，快来发布第一个吧！</p>
          <Button onClick={() => navigate('/notes')} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            发布内容
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {sortedContents.map((content) => {
            const ContentIcon = getContentTypeIcon(content.content_type);
            return (
              <Card key={content.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={content.author?.avatar_url} />
                        <AvatarFallback>
                          {content.author?.username?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900">
                            {content.author?.full_name || content.author?.username}
                          </span>
                          <Badge className={getContentTypeColor(content.content_type)}>
                            <ContentIcon className="w-3 h-3 mr-1" />
                            {getContentTypeLabel(content.content_type)}
                          </Badge>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(content.created_at)}
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleContentView(content.id)}>
                          查看详情
                        </DropdownMenuItem>
                        <DropdownMenuItem>分享</DropdownMenuItem>
                        <DropdownMenuItem>收藏</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div onClick={() => handleContentView(content.id)}>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
                      {content.title}
                    </h3>
                    
                    {content.description && (
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        {formatContent(content.description)}
                      </p>
                    )}
                    
                    {/* 标签 */}
                    {content.tags && content.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {content.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag.id} variant="outline" className="text-xs">
                            {tag.name}
                          </Badge>
                        ))}
                        {content.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{content.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <Separator className="my-4" />
                  
                  {/* 互动区域 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(content.id)}
                        className="text-gray-500 hover:text-red-500 transition-colors"
                      >
                        <Heart className="w-4 h-4 mr-1" />
                        {content.like_count}
                      </Button>
                      
                      <div className="flex items-center text-gray-500 text-sm">
                        <Eye className="w-4 h-4 mr-1" />
                        {content.view_count}
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/content/${content.id}/discussion`)}
                        className="text-gray-500 hover:text-blue-500 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        讨论
                      </Button>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleContentView(content.id)}
                    >
                      阅读全文
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Square;
