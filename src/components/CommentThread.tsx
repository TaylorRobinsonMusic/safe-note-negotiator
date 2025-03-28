'use client';

import React, { useState } from 'react';
import { Comment, User } from '../types/collaboration';

interface Props {
  comments: Comment[];
  users: User[];
  currentUser: User;
  termId: string;
  onAddComment: (content: string, parentId?: string) => void;
  onReact: (commentId: string, reaction: string) => void;
}

const CommentThread: React.FC<Props> = ({
  comments,
  users,
  currentUser,
  termId,
  onAddComment,
  onReact
}) => {
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const rootComments = comments.filter(c => !c.parentId);
  const commentsByParentId = comments.reduce((acc, comment) => {
    if (comment.parentId) {
      if (!acc[comment.parentId]) {
        acc[comment.parentId] = [];
      }
      acc[comment.parentId].push(comment);
    }
    return acc;
  }, {} as { [key: string]: Comment[] });

  const handleSubmit = (parentId?: string) => {
    if (!newComment.trim()) return;
    onAddComment(newComment, parentId);
    setNewComment('');
    setReplyTo(null);
  };

  const renderComment = (comment: Comment, depth: number = 0) => {
    const author = users.find(u => u.id === comment.userId);
    const replies = commentsByParentId[comment.id] || [];
    const hasReplies = replies.length > 0;

    return (
      <div
        key={comment.id}
        className={`${depth > 0 ? 'ml-6 mt-2' : 'mt-4'} space-y-2`}
      >
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-start space-x-3">
            {author?.avatar ? (
              <img
                src={author.avatar}
                alt={author.name}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">
                  {author?.name.charAt(0)}
                </span>
              </div>
            )}
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">
                    {author?.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {comment.updatedAt && (
                  <span className="text-xs text-gray-500">
                    (edited)
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-700">{comment.content}</p>
              <div className="flex items-center space-x-4 pt-2">
                <button
                  onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Reply
                </button>
                <div className="flex items-center space-x-2">
                  {['👍', '❤️', '🎉'].map(reaction => (
                    <button
                      key={reaction}
                      onClick={() => onReact(comment.id, reaction)}
                      className={`text-sm p-1 rounded ${
                        comment.reactions[reaction]?.includes(currentUser.id)
                          ? 'bg-blue-50'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {reaction}
                      {comment.reactions[reaction]?.length > 0 && (
                        <span className="ml-1 text-xs text-gray-500">
                          {comment.reactions[reaction].length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {replyTo === comment.id && (
          <div className="ml-6">
            <div className="flex items-start space-x-2 mt-2">
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a reply..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                />
              </div>
              <button
                onClick={() => handleSubmit(comment.id)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Reply
              </button>
            </div>
          </div>
        )}

        {hasReplies && (
          <div className="space-y-2">
            {replies.map(reply => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start space-x-2">
        <div className="flex-1">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            rows={3}
          />
        </div>
        <button
          onClick={() => handleSubmit()}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Comment
        </button>
      </div>

      <div className="space-y-4">
        {rootComments.map(comment => renderComment(comment))}
      </div>
    </div>
  );
};

export default CommentThread; 