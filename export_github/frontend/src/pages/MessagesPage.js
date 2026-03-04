import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';
import { Button } from '../components/ui/button.jsx';
import { Input } from '../components/ui/input.jsx';
import { 
  MessageCircle, Send, ArrowLeft, Phone, VideoIcon, 
  User, Clock, CheckCircle
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MessagesPage = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isFr = i18n.language?.startsWith('fr');
  const messagesEndRef = useRef(null);
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('session_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const fetchMessages = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/messages/inbox`, {
        headers: getAuthHeaders()
      });
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    if (user) {
      fetchMessages();
      // Auto-refresh messages every 10 seconds
      const interval = setInterval(fetchMessages, 10000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [user, fetchMessages]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    setSending(true);
    try {
      await axios.post(`${API}/messages/send`, {
        content: newMessage,
        recipient_id: null // null = message to admin
      }, { headers: getAuthHeaders() });
      
      setNewMessage('');
      toast.success(isFr ? 'Message envoyé!' : 'Message sent!');
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(isFr ? 'Erreur lors de l\'envoi' : 'Error sending message');
    }
    setSending(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(isFr ? 'fr-FR' : 'en-US', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#09090b] noise-bg">
        <Navigation />
        <div className="py-20 px-4 text-center">
          <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-4">
            {isFr ? 'Connectez-vous pour accéder à la messagerie' : 'Login to access messaging'}
          </p>
          <Button onClick={() => navigate('/login')} className="bg-[#EF4444]">
            {isFr ? 'Se connecter' : 'Login'}
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] noise-bg">
      <Navigation />
      
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="ghost"
            className="mb-4 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {isFr ? 'Retour' : 'Back'}
          </Button>

          {/* Header */}
          <div className="mb-6">
            <h1 
              className="text-4xl font-bold flex items-center gap-3"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              data-testid="messages-title"
            >
              <MessageCircle className="w-10 h-10 text-[#EF4444]" />
              {isFr ? 'MESSAGERIE COACH' : 'COACH MESSAGING'}
            </h1>
            <p className="text-gray-400 mt-2">
              {isFr 
                ? 'Contactez votre coach pour des conseils personnalisés' 
                : 'Contact your coach for personalized advice'}
            </p>
          </div>

          {/* Contact Options */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div 
              className="bg-[#121212] border border-[#27272a] rounded-lg p-4 text-center hover:border-green-500/50 transition-colors cursor-pointer hover:bg-green-500/10"
              onClick={() => navigate('/call?type=audio&callee=coach')}
              data-testid="audio-call-btn"
            >
              <div className="p-3 bg-green-500/20 rounded-full w-fit mx-auto mb-2">
                <Phone className="w-6 h-6 text-green-500" />
              </div>
              <p className="font-bold">{isFr ? 'Appel Audio' : 'Audio Call'}</p>
              <p className="text-green-400 text-xs mt-1">{isFr ? 'Disponible' : 'Available'}</p>
            </div>
            
            <div 
              className="bg-[#121212] border border-[#27272a] rounded-lg p-4 text-center hover:border-blue-500/50 transition-colors cursor-pointer hover:bg-blue-500/10"
              onClick={() => navigate('/call?type=video&callee=coach')}
              data-testid="video-call-btn"
            >
              <div className="p-3 bg-blue-500/20 rounded-full w-fit mx-auto mb-2">
                <VideoIcon className="w-6 h-6 text-blue-500" />
              </div>
              <p className="font-bold">{isFr ? 'Appel Vidéo' : 'Video Call'}</p>
              <p className="text-blue-400 text-xs mt-1">{isFr ? 'Disponible' : 'Available'}</p>
            </div>
            
            <div className="bg-[#121212] border border-[#EF4444]/50 rounded-lg p-4 text-center">
              <div className="p-3 bg-[#EF4444]/20 rounded-full w-fit mx-auto mb-2">
                <MessageCircle className="w-6 h-6 text-[#EF4444]" />
              </div>
              <p className="font-bold text-[#EF4444]">{isFr ? 'Chat Texte' : 'Text Chat'}</p>
              <p className="text-gray-500 text-xs mt-1">{isFr ? 'Disponible' : 'Available'}</p>
            </div>
          </div>

          {/* Chat Container */}
          <div className="bg-[#121212] border border-[#27272a] rounded-lg overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 border-b border-[#27272a] flex items-center gap-3">
              <div className="p-2 bg-[#EF4444] rounded-full">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold">Coach FitMaxPro</h3>
                <p className="text-green-400 text-xs flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  {isFr ? 'En ligne' : 'Online'}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="h-96 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-400 py-12">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>{isFr ? 'Aucun message pour le moment' : 'No messages yet'}</p>
                  <p className="text-sm mt-2">
                    {isFr 
                      ? 'Envoyez un message à votre coach!' 
                      : 'Send a message to your coach!'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Welcome message */}
                  <div className="flex justify-start">
                    <div className="max-w-[80%] bg-[#27272a] p-3 rounded-lg rounded-bl-none">
                      <p className="text-sm">
                        {isFr 
                          ? 'Bienvenue! Je suis votre coach FitMaxPro. Comment puis-je vous aider aujourd\'hui? 💪' 
                          : 'Welcome! I\'m your FitMaxPro coach. How can I help you today? 💪'}
                      </p>
                      <p className="text-gray-500 text-xs mt-1">Coach</p>
                    </div>
                  </div>
                  
                  {messages.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`flex ${msg.sender_id === user.user_id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] p-3 rounded-lg ${
                        msg.sender_id === user.user_id
                          ? 'bg-[#EF4444] text-white rounded-br-none' 
                          : 'bg-[#27272a] text-white rounded-bl-none'
                      }`}>
                        <p className="text-sm">{msg.content}</p>
                        <div className={`flex items-center gap-1 mt-1 ${
                          msg.sender_id === user.user_id ? 'justify-end' : ''
                        }`}>
                          <Clock className="w-3 h-3 text-gray-400" />
                          <p className={`text-xs ${msg.sender_id === user.user_id ? 'text-white/60' : 'text-gray-500'}`}>
                            {formatDate(msg.created_at)}
                          </p>
                          {msg.sender_id === user.user_id && msg.read && (
                            <CheckCircle className="w-3 h-3 text-green-400 ml-1" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-[#27272a]">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={isFr ? "Écrivez votre message..." : "Write your message..."}
                  className="bg-[#09090b] border-[#27272a]"
                  onKeyPress={(e) => e.key === 'Enter' && !sending && sendMessage()}
                  data-testid="message-input"
                />
                <Button 
                  onClick={sendMessage} 
                  className="bg-[#EF4444] hover:bg-[#DC2626]"
                  disabled={!newMessage.trim() || sending}
                  data-testid="send-message-btn"
                >
                  {sending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-gray-500 text-xs mt-2 text-center">
                {isFr 
                  ? 'Réponse sous 24h maximum' 
                  : 'Response within 24 hours maximum'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
