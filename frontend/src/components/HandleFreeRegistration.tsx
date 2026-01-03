
import { useState, useRef, useEffect } from 'react';
import { 
  X, CreditCard, QrCode, Copy, CheckCircle, AlertCircle, Loader, 
  Upload, User, Mail, RefreshCw
} from 'lucide-react';
import { useUser } from '@/hooks/authHook';
import { api } from '@/service/api';
import { API_URL } from '@/config/API_URL';
import qr from "@/assets/qr.jpeg";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  registrationFee: number;
  hackathonName: string;
  hackathonId: number;
  userEmail: string;
  onPaymentSuccess: (orderData: any) => void;
  existingOrderId?: string;
}

interface UserDetails {
  phone: string;
  name: string;
  email: string;
  collegeName?: string;
}

interface PaymentOrder {
  id: string;
  amount: number;
  currency: string;
  status: 'created' | 'paid' | 'failed';
  paymentMethod?: 'razorpay' | 'qrcode';
}

const HandleFreeRegistration: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  registrationFee,
  hackathonName,
  hackathonId,
  userEmail,
  onPaymentSuccess,
  existingOrderId
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'razorpay' | 'qrcode' | 'free' | null>('free');
  const [paymentStep, setPaymentStep] = useState<'method' | 'details' | 'processing' | 'verification'>('details');
  const [isCopied, setIsCopied] = useState(false);
  const { user } = useUser();
  const [utrNumber, setUtrNumber] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string>('');
  const [userDetails, setUserDetails] = useState<UserDetails>({
    phone: user?.phone || '',
    name: user?.name || 'your name',
    email: user?.email || userEmail,
    collegeName : user?.collegeName || ''
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<PaymentOrder | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'failed'>('pending');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMethodSelect = (method: 'razorpay' | 'qrcode' | 'free') => {
    setSelectedMethod(method);
    setError('');
    
    setPaymentStep('details');
  };

const validateUserDetails = () => {
  const { name, phone, email, collegeName } = userDetails;

  // Trim all values once
  const trimmedName = name?.trim();
  const trimmedPhone = phone?.trim();
  const trimmedEmail = email?.trim();
  const trimmedCollege = collegeName?.trim();

  // 1️⃣ Required fields
  if (!trimmedName || !trimmedPhone || !trimmedEmail || !trimmedCollege) {
    setError('All fields are required');
    return false;
  }

  // 2️⃣ Name validation (only letters + spaces, min 2 chars)
  if (!/^[a-zA-Z ]{2,50}$/.test(trimmedName)) {
    setError('Please enter a valid name');
    return false;
  }

  // 3️⃣ Indian phone number validation
  if (!/^[6-9]\d{9}$/.test(trimmedPhone)) {
    setError('Please enter a valid 10-digit mobile number');
    return false;
  }

  // 5️⃣ College name validation (min 3 chars)
  if (trimmedCollege.length < 3) {
    setError('Please enter a valid college name');
    return false;
  }

  // ✅ Clear error if everything is valid
  setError('');
  return true;
};


  const handleFreeRegistration = async () => {
      if (!validateUserDetails()) {
        return;
      }
  
      setIsLoading(true);
      setError('');
  
      try {
        const formData = new FormData();
        formData.append('hackathonId', hackathonId.toString());
        formData.append('email', userEmail);
        formData.append('name', userDetails.name);
        formData.append('phone', userDetails.phone);
        formData.append('collegeName', userDetails.collegeName || '');
        formData.append('amount', registrationFee.toString());
  
        const response = await api.post(`${API_URL}/api/registrations/free`, formData);
  
        if (response.data.success) {
          onPaymentSuccess({
            orderId: response.data.paymentId,
            paymentMethod: 'free',
            status: 'pending_verification'
          });
        } else {
          throw new Error(response.data.message);
        }
      } catch (error: any) {
        console.error('Free registration error:', error);
        setError(error.message || 'Failed to process free registration. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };


  const handleCopyUtr = () => {
    navigator.clipboard.writeText(utrNumber);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const resetModal = () => {
    setSelectedMethod(null);
    setPaymentStep('method');
    setIsCopied(false);
    setUtrNumber('');
    setScreenshot(null);
    setScreenshotPreview('');
    setUserDetails({ phone: '', name: '', email: userEmail });
    setError('');
    setIsLoading(false);
    setCurrentOrder(null);
    setVerificationStatus('pending');
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="glass-effect rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 w-full max-w-md sm:max-w-lg md:max-w-2xl shadow-2xl shadow-blue-500/30 border-2 border-blue-500/30 relative max-h-[95vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-6 md:right-6 text-slate-400 hover:text-white transition-colors z-10"
          disabled={isLoading}
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-4 sm:mb-6 md:mb-8">
          <h3 className="font-orbitron text-xl sm:text-2xl md:text-3xl mb-1 sm:mb-2 text-blue-400">Complete Registration</h3>
          <p className="text-slate-300 text-sm sm:text-base md:text-lg">
            Pay registration fee of{' '}
            <span className="font-orbitron text-lg sm:text-xl mx-1 md:text-2xl text-green-400 font-bold">
              ₹{registrationFee}
            </span>
          <span className="text-slate-400 text-xs mx-1 sm:text-sm mt-1 sm:mt-2">for {hackathonName}</span>
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm break-words">{error}</span>
            </div>
          </div>
        )}

        {/* User Details & Payment */}
        {paymentStep === 'details' && (
          <div className="space-y-4 sm:space-y-4">
            {/* User Details */}
            <div className="glass-effect p-4 sm:p-4 rounded-lg sm:rounded-xl border border-slate-600/50">
              <h4 className="font-orbitron text-base sm:text-lg text-blue-400 mb-3 sm:mb-4 flex items-center gap-2">
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
                Important Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm text-slate-400 mb-1 sm:mb-2">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={userDetails.name}
                    onChange={(e) => setUserDetails(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Your name"
                    className="w-full p-2 sm:p-3 glass-effect rounded-lg border border-slate-600/50 focus:border-blue-500/50 transition-all outline-none text-white text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm text-slate-400 mb-1 sm:mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={userDetails.phone}
                    onChange={(e) => setUserDetails(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Your WhatsApp number"
                    className="w-full p-2 sm:p-3 glass-effect rounded-lg border border-slate-600/50 focus:border-blue-500/50 transition-all outline-none text-white text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm text-slate-400 mb-1 sm:mb-2">Organization or College Name *</label>
                  <input
                    type="text"
                    required
                    value={userDetails.collegeName}
                    onChange={(e) => setUserDetails(prev => ({ ...prev, collegeName: e.target.value }))}
                    placeholder="Your Organization or College Name"
                    className="w-full p-2 sm:p-3 glass-effect rounded-lg border border-slate-600/50 focus:border-blue-500/50 transition-all outline-none text-white text-sm"
                  />
                </div>
              </div>
            </div>
           <button
  onClick={handleFreeRegistration}
  disabled={
    !userDetails.name.trim() ||
    !userDetails.phone.trim() ||
    !userDetails.collegeName.trim() ||
    isLoading
  }
  className="
    w-full mx-auto py-2 sm:py-3
    rounded-lg font-orbitron text-white
    text-sm sm:text-base
    transition-all duration-300

    bg-gradient-to-r from-blue-600 to-purple-600
    hover:scale-105
    shadow-lg shadow-blue-500/50

    disabled:bg-gray-400
    disabled:from-gray-400 disabled:to-gray-400
    disabled:shadow-none
    disabled:hover:scale-100
    disabled:cursor-not-allowed
    disabled:opacity-70
  "
>
  {isLoading ? 'Processing...' : 'Submit Payment Details'}
</button>

          </div>
        )}

        {/* Processing State */}
        {paymentStep === 'processing' && (
          <div className="glass-effect p-4 sm:p-6 md:p-8 rounded-lg sm:rounded-xl border border-slate-600/50 text-center">
            <Loader className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mx-auto mb-3 sm:mb-4 text-blue-400 animate-spin" />
            <h4 className="font-orbitron text-lg sm:text-xl md:text-2xl text-blue-400 mb-1 sm:mb-2">Processing Payment...</h4>
            <p className="text-slate-300 text-sm sm:text-base">Please wait while we process your transaction</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HandleFreeRegistration;