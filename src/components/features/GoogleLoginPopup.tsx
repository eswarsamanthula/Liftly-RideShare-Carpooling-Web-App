import React from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { X } from 'lucide-react';

interface GoogleLoginPopupProps {
  onAccountSelect: (account: any) => void;
  onClose: () => void;
}

const GoogleLoginPopup: React.FC<GoogleLoginPopupProps> = ({ onAccountSelect, onClose }) => {
  const handleGoogleSuccess = (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      const decodedToken = JSON.parse(atob(credentialResponse.credential.split('.')[1]));
      const account = {
        id: decodedToken.sub,
        name: decodedToken.name,
        email: decodedToken.email,
        avatar: decodedToken.picture
      };
      onAccountSelect(account);
    }
  };

  const handleGoogleError = () => {
    console.error('Login Failed');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-96 bg-white shadow-2xl">
        <CardHeader className="text-center pb-4 relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-center justify-center mb-2">
            <div className="w-8 h-8 bg-blue-500 rounded mr-2 flex items-center justify-center text-white font-bold">
              G
            </div>
            <span className="text-lg font-medium text-gray-700">Sign in with Google</span>
          </div>
          <p className="text-sm text-gray-600">Choose your Google account</p>
        </CardHeader>

        <CardContent className="p-4 flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default GoogleLoginPopup;
