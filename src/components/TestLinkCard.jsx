import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink, Clock, Trash2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const TestLinkCard = ({ link, onCopy, onDelete }) => {
  const { t } = useLanguage();
  const fullUrl = `${window.location.origin}/test/${link.id}`;
  
  const isExpired = new Date(link.expiresAt) < new Date();

  return (
    <div className={`border rounded-lg p-4 hover:shadow-md transition-shadow relative group ${isExpired ? 'bg-red-50/50 border-red-100' : 'border-indigo-100 bg-white'}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className={`font-semibold text-lg ${isExpired ? 'text-gray-500' : 'text-indigo-900'}`}>
            Test Link #{link.id.slice(0, 8)}
          </h3>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-sm text-gray-600">
              {t("Created")}: {new Date(link.createdAt).toLocaleDateString()}
            </p>
            <div className={`flex items-center text-xs ${isExpired ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                <Clock className="h-3 w-3 mr-1" />
                Expires: {new Date(link.expiresAt).toLocaleString()}
            </div>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${isExpired ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-green-100 text-green-800'}`}>
            {isExpired ? 'Expired' : t("Active")}
          </span>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onDelete(link.id)}
            title="Delete Link"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="bg-gray-50 p-3 rounded-md mb-3 font-mono text-sm break-all border border-gray-200 flex justify-between items-center gap-2">
        <span className="truncate">{fullUrl}</span>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onCopy(link.id)}
          className="flex-1"
          disabled={isExpired}
        >
          <Copy className="h-4 w-4 mr-2" />
          {t("Copy Link")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(fullUrl, '_blank')}
          disabled={isExpired}
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default TestLinkCard;