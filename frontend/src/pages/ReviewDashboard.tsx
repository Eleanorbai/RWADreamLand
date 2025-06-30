import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  User, 
  Calendar, 
  Check, 
  X, 
  AlertCircle,
  Eye,
  MessageCircle
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

import { ReviewRequestWithDetails, ReviewStatus, reviewStatusNames, reviewStatusColors } from '../types/note';
import { UserRole } from '../types/user';
import { reviewApi, userApi } from '../lib/api';

interface ReviewDashboardProps {}

export default function ReviewDashboard({}: ReviewDashboardProps) {
  const [reviewRequests, setReviewRequests] = useState<ReviewRequestWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ReviewRequestWithDetails | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkPermissions();
    loadReviewRequests();
  }, []);

  const checkPermissions = async () => {
    try {
      const userData = await userApi.getCurrentUser();
      setCurrentUser(userData);
      
      // 检查权限
      if (userData.role !== UserRole.REVIEWER && userData.role !== UserRole.ADMIN) {
        toast({
          title: '权限不足',
          description: '您没有访问审核页面的权限',
          variant: 'destructive',
        });
        navigate('/');
        return;
      }
    } catch (err: any) {
      toast({
        title: '权限验证失败',
        description: '请重新登录',
        variant: 'destructive',
      });
      navigate('/login');
    }
  };

  const loadReviewRequests = async () => {
    try {
      setLoading(true);
      const requests = await reviewApi.getReviewRequests();
      setReviewRequests(requests);
    } catch (err: any) {
      toast({
        title: '加载失败',
        description: err.response?.data?.detail || '获取审核列表失败',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReview = (request: ReviewRequestWithDetails) => {
    setSelectedRequest(request);
    setReviewComment('');
    setDialogOpen(true);
  };

  const submitReview = async (status: ReviewStatus) => {
    if (!selectedRequest) return;

    try {
      setSubmitting(true);
      await reviewApi.createReview({
        review_request_id: selectedRequest.id,
        status,
        comment: reviewComment.trim() || undefined,
      });

      // 更新本地状态
      setReviewRequests(requests => 
        requests.map(req => 
          req.id === selectedRequest.id 
            ? { ...req, status, review_comment: reviewComment }
            : req
        )
      );

      setDialogOpen(false);
      setSelectedRequest(null);
      setReviewComment('');

      toast({
        title: '审核完成',
        description: `笔记已${reviewStatusNames[status]}`,
      });
    } catch (err: any) {
      toast({
        title: '审核失败',
        description: err.response?.data?.detail || '提交审核结果失败',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getContentPreview = (content: string, maxLength = 150) => {
    const plainText = content.replace(/[#*_`\[\]()]/g, '').trim();
    return plainText.length > maxLength 
      ? plainText.substring(0, maxLength) + '...'
      : plainText;
  };

  const pendingRequests = reviewRequests.filter(req => req.status === ReviewStatus.PENDING);
  const completedRequests = reviewRequests.filter(req => req.status !== ReviewStatus.PENDING);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面头部 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">审核管理</h1>
          <p className="text-gray-600 mt-2">
            审核用户提交的笔记内容
          </p>
        </div>

        {/* 统计概览 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">待审核</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingRequests.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">已审核</p>
                  <p className="text-2xl font-bold text-gray-900">{completedRequests.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">总计</p>
                  <p className="text-2xl font-bold text-gray-900">{reviewRequests.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 待审核列表 */}
        {pendingRequests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">待审核笔记</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {pendingRequests.map((request) => (
                <Card key={request.id} className="border-yellow-200 bg-yellow-50">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {request.note?.title || '无标题'}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {request.note && getContentPreview(request.note.content)}
                        </CardDescription>
                      </div>
                      <Badge className={reviewStatusColors[request.status]}>
                        {reviewStatusNames[request.status]}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* 作者信息 */}
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={request.author?.avatar_url} />
                        <AvatarFallback>
                          {request.author?.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{request.author?.username}</p>
                        <p className="text-xs text-gray-500">
                          提交于 {formatDate(request.submitted_at)}
                        </p>
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/notes/${request.note_id}`)}
                        className="flex-1"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        查看
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleReview(request)}
                        className="flex-1"
                      >
                        <MessageCircle className="w-3 h-3 mr-1" />
                        审核
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 已审核列表 */}
        {completedRequests.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">审核历史</h2>
            <div className="space-y-4">
              {completedRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={request.author?.avatar_url} />
                          <AvatarFallback>
                            {request.author?.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <h4 className="font-medium">{request.note?.title || '无标题'}</h4>
                          <p className="text-sm text-gray-600">
                            作者：{request.author?.username} • 
                            提交于 {formatDate(request.submitted_at)}
                          </p>
                          {request.review_comment && (
                            <p className="text-sm text-gray-700 mt-1">
                              审核意见：{request.review_comment}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Badge className={reviewStatusColors[request.status]}>
                          {reviewStatusNames[request.status]}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/notes/${request.note_id}`)}
                        >
                          查看
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 空状态 */}
        {reviewRequests.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                暂无审核任务
              </h3>
              <p className="text-gray-600">
                目前没有用户提交的笔记需要审核
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 审核对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>审核笔记</DialogTitle>
            <DialogDescription>
              对用户提交的笔记进行审核，并提供审核意见
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              {/* 笔记信息 */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">{selectedRequest.note?.title}</h4>
                <p className="text-sm text-gray-600 mb-2">
                  作者：{selectedRequest.author?.username}
                </p>
                <p className="text-sm text-gray-700">
                  {selectedRequest.note && getContentPreview(selectedRequest.note.content, 200)}
                </p>
              </div>

              {/* 审核意见 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  审核意见（可选）
                </label>
                <Textarea
                  placeholder="请输入审核意见..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={4}
                />
              </div>

              {/* 操作按钮 */}
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={submitting}
                >
                  取消
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => submitReview(ReviewStatus.REJECTED)}
                  disabled={submitting}
                >
                  <X className="w-4 h-4 mr-2" />
                  拒绝
                </Button>
                <Button
                  variant="outline"
                  onClick={() => submitReview(ReviewStatus.REVISION_REQUIRED)}
                  disabled={submitting}
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  需要修改
                </Button>
                <Button
                  onClick={() => submitReview(ReviewStatus.APPROVED)}
                  disabled={submitting}
                >
                  {submitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  通过
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
