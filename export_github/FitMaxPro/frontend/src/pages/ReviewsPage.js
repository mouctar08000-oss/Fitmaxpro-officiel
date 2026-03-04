import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';
import { Button } from '../components/ui/button.jsx';
import { Input } from '../components/ui/input.jsx';
import { 
  ArrowLeft, Star, MessageSquare, Send, User, 
  ThumbsUp, Calendar, Reply, Trash2, Heart, CheckCircle, Award
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ReviewsPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isFr = i18n.language?.startsWith('fr');
  
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ total_reviews: 0, average_rating: 0 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    content: '',
    is_public: true
  });
  const [submitting, setSubmitting] = useState(false);
  const [likingReview, setLikingReview] = useState(null);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('session_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const fetchReviews = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/reviews`);
      setReviews(response.data.reviews || []);
      setStats({
        total_reviews: response.data.total_reviews,
        average_rating: response.data.average_rating
      });
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleLike = async (reviewId) => {
    if (!user) {
      toast.error(isFr ? 'Connectez-vous pour aimer un avis' : 'Login to like a review');
      return;
    }
    
    setLikingReview(reviewId);
    try {
      const response = await axios.post(`${API}/reviews/${reviewId}/like`, {}, { headers: getAuthHeaders() });
      toast.success(response.data.action === 'liked' 
        ? (isFr ? 'Avis aimé!' : 'Review liked!') 
        : (isFr ? 'Like retiré' : 'Like removed'));
      fetchReviews();
    } catch (error) {
      console.error('Error liking review:', error);
      toast.error(isFr ? 'Erreur' : 'Error');
    }
    setLikingReview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error(isFr ? 'Connectez-vous pour laisser un avis' : 'Login to leave a review');
      navigate('/login');
      return;
    }
    
    if (!newReview.title || !newReview.content) {
      toast.error(isFr ? 'Veuillez remplir tous les champs' : 'Please fill all fields');
      return;
    }
    
    setSubmitting(true);
    try {
      const response = await axios.post(`${API}/reviews`, newReview, { headers: getAuthHeaders() });
      const pointsMsg = response.data.points_earned 
        ? (isFr ? ` (+${response.data.points_earned} points!)` : ` (+${response.data.points_earned} points!)`)
        : '';
      toast.success((isFr ? 'Merci pour votre avis!' : 'Thank you for your review!') + pointsMsg);
      setNewReview({ rating: 5, title: '', content: '', is_public: true });
      setShowForm(false);
      fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      const errorMsg = error.response?.data?.detail || (isFr ? 'Erreur lors de l\'envoi' : 'Error submitting review');
      toast.error(errorMsg);
    }
    setSubmitting(false);
  };

  const renderStars = (rating, interactive = false, onChange = null) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`w-5 h-5 ${interactive ? 'cursor-pointer' : ''} ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'
            }`}
            onClick={() => interactive && onChange && onChange(star)}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(isFr ? 'fr-FR' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

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
      
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="mb-6 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {isFr ? 'Retour' : 'Back'}
          </Button>

          {/* Header */}
          <div className="text-center mb-12">
            <h1 
              className="text-5xl font-bold mb-4"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              <MessageSquare className="w-12 h-12 inline mr-4 text-[#EF4444]" />
              {isFr ? 'AVIS CLIENTS' : 'CUSTOMER REVIEWS'}
            </h1>
            
            {/* Stats */}
            <div className="flex items-center justify-center gap-6 mt-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-4xl font-bold text-yellow-400">
                    {stats.average_rating}
                  </span>
                  <Star className="w-8 h-8 fill-yellow-400 text-yellow-400" />
                </div>
                <p className="text-gray-400 text-sm">{isFr ? 'Note moyenne' : 'Average rating'}</p>
              </div>
              <div className="w-px h-12 bg-[#27272a]" />
              <div className="text-center">
                <span className="text-4xl font-bold">{stats.total_reviews}</span>
                <p className="text-gray-400 text-sm">{isFr ? 'Avis' : 'Reviews'}</p>
              </div>
            </div>
          </div>

          {/* Add Review Button */}
          {user && !showForm && (
            <Button
              onClick={() => setShowForm(true)}
              className="w-full mb-8 bg-[#EF4444] hover:bg-[#DC2626] py-6 text-lg"
            >
              <Star className="w-5 h-5 mr-2" />
              {isFr ? 'Donner mon avis' : 'Leave a review'}
            </Button>
          )}

          {!user && (
            <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6 mb-8 text-center">
              <p className="text-gray-400 mb-4">
                {isFr ? 'Connectez-vous pour laisser votre avis' : 'Login to leave your review'}
              </p>
              <Button onClick={() => navigate('/login')} className="bg-[#EF4444]">
                {isFr ? 'Se connecter' : 'Login'}
              </Button>
            </div>
          )}

          {/* Review Form */}
          {showForm && (
            <div className="bg-[#121212] border border-[#EF4444]/30 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-[#EF4444]" />
                {isFr ? 'Votre avis' : 'Your review'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Rating */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    {isFr ? 'Note' : 'Rating'}
                  </label>
                  {renderStars(newReview.rating, true, (rating) => setNewReview({...newReview, rating}))}
                </div>
                
                {/* Title */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    {isFr ? 'Titre' : 'Title'}
                  </label>
                  <Input
                    value={newReview.title}
                    onChange={(e) => setNewReview({...newReview, title: e.target.value})}
                    placeholder={isFr ? "Résumez votre expérience" : "Summarize your experience"}
                    className="bg-[#09090b] border-[#27272a]"
                  />
                </div>
                
                {/* Content */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    {isFr ? 'Votre avis' : 'Your review'}
                  </label>
                  <textarea
                    value={newReview.content}
                    onChange={(e) => setNewReview({...newReview, content: e.target.value})}
                    placeholder={isFr ? "Partagez votre expérience avec FitMaxPro..." : "Share your experience with FitMaxPro..."}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-md p-3 text-white min-h-[120px]"
                  />
                </div>
                
                {/* Public toggle */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newReview.is_public}
                    onChange={(e) => setNewReview({...newReview, is_public: e.target.checked})}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-400">
                    {isFr ? 'Rendre public (visible par tous)' : 'Make public (visible to everyone)'}
                  </span>
                </div>
                
                <div className="flex gap-3">
                  <Button type="submit" className="bg-[#EF4444]" disabled={submitting}>
                    {submitting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    {isFr ? 'Publier' : 'Submit'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-[#27272a]">
                    {isFr ? 'Annuler' : 'Cancel'}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <div className="bg-[#121212] border border-[#27272a] rounded-lg p-12 text-center">
                <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">
                  {isFr ? 'Aucun avis pour le moment' : 'No reviews yet'}
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  {isFr ? 'Soyez le premier à donner votre avis!' : 'Be the first to leave a review!'}
                </p>
              </div>
            ) : (
              reviews.map((review) => (
                <div key={review.review_id} className="bg-[#121212] border border-[#27272a] rounded-lg p-6 hover:border-[#27272a]/50 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#EF4444]/20 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-[#EF4444]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold">{review.user_name}</p>
                          {/* Badge abonné vérifié */}
                          {review.verified_subscriber && (
                            <span className="flex items-center gap-1 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                              <CheckCircle className="w-3 h-3" />
                              {isFr ? 'Vérifié' : 'Verified'}
                            </span>
                          )}
                          {/* Badge tier */}
                          {review.subscription_tier === 'vip' && (
                            <span className="flex items-center gap-1 text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                              <Award className="w-3 h-3" />
                              VIP
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {renderStars(review.rating)}
                          <span className="text-gray-500 text-sm flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(review.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Like button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(review.review_id)}
                      disabled={likingReview === review.review_id}
                      className={`flex items-center gap-1 ${
                        review.likes?.includes(user?.user_id) 
                          ? 'text-red-400 hover:text-red-300' 
                          : 'text-gray-400 hover:text-red-400'
                      }`}
                      data-testid={`like-review-${review.review_id}`}
                    >
                      <Heart className={`w-4 h-4 ${review.likes?.includes(user?.user_id) ? 'fill-current' : ''}`} />
                      <span>{review.likes_count || 0}</span>
                    </Button>
                  </div>
                  
                  <h3 className="font-bold text-lg mb-2">{review.title}</h3>
                  <p className="text-gray-400">{review.content}</p>
                  
                  {/* Admin liked badge */}
                  {review.admin_liked && (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="flex items-center gap-1 text-xs bg-[#EF4444]/20 text-[#EF4444] px-2 py-1 rounded-full">
                        <Heart className="w-3 h-3 fill-current" />
                        {isFr ? 'Aimé par le Coach' : 'Liked by Coach'}
                      </span>
                    </div>
                  )}
                  
                  {/* Admin Response */}
                  {review.admin_response && (
                    <div className="mt-4 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Reply className="w-4 h-4 text-[#EF4444]" />
                        <span className="font-bold text-[#EF4444]">
                          {isFr ? 'Réponse du Coach' : 'Coach Response'}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {review.admin_response_at && formatDate(review.admin_response_at)}
                        </span>
                      </div>
                      <p className="text-gray-300">{review.admin_response}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewsPage;
