import React from 'react';
import { 
  MessageCircle, Star, CheckCircle, Award, Heart, 
  Send, X, Trash2, RefreshCw 
} from 'lucide-react';
import { Button } from '../ui/button.jsx';
import { Input } from '../ui/input.jsx';

const AdminReviews = ({
  allReviews,
  reviewStats,
  replyingTo,
  setReplyingTo,
  replyText,
  setReplyText,
  respondToReview,
  deleteReview,
  adminLikeReview,
  fetchAllReviews,
  isFr
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-yellow-400" />
          {isFr ? 'Gestion des Avis Clients' : 'Customer Reviews Management'}
        </h2>
        <Button onClick={fetchAllReviews} variant="outline" size="sm" className="border-[#27272a]">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Stats */}
      {reviewStats && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-[#121212] border border-[#27272a] rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-yellow-400">{reviewStats.average_rating}</p>
            <p className="text-gray-500 text-xs">{isFr ? 'Note moyenne' : 'Avg Rating'}</p>
          </div>
          <div className="bg-[#121212] border border-[#27272a] rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">{reviewStats.total}</p>
            <p className="text-gray-500 text-xs">Total</p>
          </div>
          {[5,4,3,2,1].map(star => (
            <div key={star} className="bg-[#121212] border border-[#27272a] rounded-lg p-3 text-center">
              <p className="text-xl font-bold">{reviewStats.distribution?.[star] || 0}</p>
              <p className="text-gray-500 text-xs flex items-center justify-center gap-1">
                {star} <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {allReviews.length === 0 ? (
          <div className="bg-[#121212] border border-[#27272a] rounded-lg p-8 text-center">
            <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">{isFr ? 'Aucun avis' : 'No reviews'}</p>
          </div>
        ) : (
          allReviews.map(review => (
            <div key={review.review_id} className="bg-[#121212] border border-[#27272a] rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="font-bold">{review.user_name}</span>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`w-4 h-4 ${s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`} />
                      ))}
                    </div>
                    <span className="text-gray-500 text-xs">
                      {new Date(review.created_at).toLocaleDateString(isFr ? 'fr-FR' : 'en-US')}
                    </span>
                    {review.verified_subscriber && (
                      <span className="flex items-center gap-1 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        {isFr ? 'Vérifié' : 'Verified'}
                      </span>
                    )}
                    {review.subscription_tier === 'vip' && (
                      <span className="flex items-center gap-1 text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                        <Award className="w-3 h-3" />
                        VIP
                      </span>
                    )}
                    {!review.is_public && (
                      <span className="bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded text-xs">
                        {isFr ? 'Privé' : 'Private'}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold mb-1">{review.title}</h3>
                  <p className="text-gray-400 text-sm">{review.content}</p>
                  
                  {review.admin_liked && (
                    <div className="mt-2">
                      <span className="inline-flex items-center gap-1 text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full">
                        <Heart className="w-3 h-3 fill-current" />
                        {isFr ? 'Vous avez aimé' : 'You liked this'}
                      </span>
                    </div>
                  )}
                  
                  {review.admin_response && (
                    <div className="mt-3 bg-green-500/10 border border-green-500/30 rounded p-3">
                      <p className="text-green-400 text-xs mb-1 font-bold">{isFr ? 'Votre réponse:' : 'Your response:'}</p>
                      <p className="text-gray-300 text-sm">{review.admin_response}</p>
                    </div>
                  )}
                  
                  {replyingTo === review.review_id && (
                    <div className="mt-3 flex gap-2">
                      <Input
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={isFr ? "Votre réponse..." : "Your response..."}
                        className="bg-[#09090b] border-[#27272a] flex-1"
                      />
                      <Button onClick={() => respondToReview(review.review_id)} className="bg-green-500">
                        <Send className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" onClick={() => { setReplyingTo(null); setReplyText(''); }}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => adminLikeReview(review.review_id)}
                    className={`${review.admin_liked ? 'border-red-500 text-red-400 bg-red-500/10' : 'border-gray-500/30 text-gray-400'}`}
                  >
                    <Heart className={`w-4 h-4 ${review.admin_liked ? 'fill-current' : ''}`} />
                  </Button>
                  {!review.admin_response && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setReplyingTo(review.review_id)}
                      className="border-green-500/30 text-green-400"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteReview(review.review_id)}
                    className="border-red-500/30 text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminReviews;
