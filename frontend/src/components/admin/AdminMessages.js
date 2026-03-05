import React from 'react';
import { 
  Mail, MessageCircle, Send, Trash2, RefreshCw, User, Clock 
} from 'lucide-react';
import { Button } from '../ui/button.jsx';
import { Input } from '../ui/input.jsx';

const AdminMessages = ({
  conversations,
  selectedConversation,
  conversationMessages,
  newMessage,
  setNewMessage,
  sendingMessage,
  fetchConversations,
  fetchConversation,
  sendMessage,
  isFr
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Conversations List */}
      <div className="lg:col-span-1 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-400" />
            {isFr ? 'Conversations' : 'Conversations'}
          </h2>
          <Button onClick={fetchConversations} variant="outline" size="sm" className="border-[#27272a]">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2 max-h-[70vh] overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="bg-[#121212] border border-[#27272a] rounded-lg p-8 text-center">
              <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">{isFr ? 'Aucune conversation' : 'No conversations'}</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.user_id}
                onClick={() => fetchConversation(conv.user_id)}
                className={`bg-[#121212] border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedConversation?.user_id === conv.user_id
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-[#27272a] hover:border-[#3f3f46]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium">{conv.user_name || 'Utilisateur'}</p>
                      <p className="text-gray-500 text-xs">{conv.user_email}</p>
                    </div>
                  </div>
                  {conv.unread_count > 0 && (
                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                      {conv.unread_count}
                    </span>
                  )}
                </div>
                {conv.last_message && (
                  <p className="text-gray-400 text-sm mt-2 truncate">
                    {conv.last_message.content}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Conversation Messages */}
      <div className="lg:col-span-2">
        {selectedConversation ? (
          <div className="bg-[#121212] border border-[#27272a] rounded-lg h-[75vh] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-[#27272a] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold">{selectedConversation.user_name}</p>
                  <p className="text-gray-500 text-xs">{selectedConversation.user_email}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {conversationMessages.map((msg, idx) => (
                <div
                  key={msg.message_id || idx}
                  className={`flex ${msg.is_from_admin ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      msg.is_from_admin
                        ? 'bg-blue-600 text-white'
                        : 'bg-[#27272a] text-white'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-xs mt-1 ${msg.is_from_admin ? 'text-blue-200' : 'text-gray-500'}`}>
                      {new Date(msg.created_at).toLocaleString(isFr ? 'fr-FR' : 'en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: '2-digit',
                        month: 'short'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-[#27272a]">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={isFr ? "Votre message..." : "Your message..."}
                  className="bg-[#09090b] border-[#27272a] flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <Button onClick={sendMessage} disabled={sendingMessage || !newMessage.trim()} className="bg-blue-600">
                  {sendingMessage ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#121212] border border-[#27272a] rounded-lg h-[75vh] flex items-center justify-center">
            <div className="text-center text-gray-400">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>{isFr ? 'Sélectionnez une conversation' : 'Select a conversation'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMessages;
