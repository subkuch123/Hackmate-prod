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
}

interface PaymentOrder {
  id: string;
  amount: number;
  currency: string;
  status: 'created' | 'paid' | 'failed';
  paymentMethod?: 'razorpay' | 'qrcode';
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  registrationFee,
  hackathonName,
  hackathonId,
  userEmail,
  onPaymentSuccess,
  existingOrderId
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'razorpay' | 'qrcode' | null>(null);
  const [paymentStep, setPaymentStep] = useState<'method' | 'details' | 'processing' | 'verification'>('method');
  const [isCopied, setIsCopied] = useState(false);
  const { user } = useUser();
  const [utrNumber, setUtrNumber] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string>('');
  const [userDetails, setUserDetails] = useState<UserDetails>({
    phone: user?.phone || '',
    name: user?.name || 'your name',
    email: user?.email || userEmail
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<PaymentOrder | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'failed'>('pending');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateUtrNumber = () => {
    return `UTR${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(0, 16);
  };

  const initializeRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const paymentMethods = [
    // {
    //   id: 'razorpay' as const,
    //   name: 'Instant Payment',
    //   description: 'Pay securely with Razorpay',
    //   icon: <CreditCard className="w-5 h-5" />
    // },
    {
      id: 'qrcode' as const,
      name: 'QR Code / UPI',
      description: 'Scan QR code or use UPI',
      icon: <QrCode className="w-5 h-5" />
    }
  ];

  const handleMethodSelect = (method: 'razorpay' | 'qrcode') => {
    setSelectedMethod(method);
    setError('');
    
    if (method === 'qrcode') {
      setUtrNumber(generateUtrNumber());
    }
    
    setPaymentStep('details');
  };

  const validateUserDetails = () => {
    if (!userDetails.phone.trim() || !userDetails.name.trim() || !userDetails.email.trim()) {
      setError('Please fill all required fields');
      return false;
    }
    
    if (userDetails.phone.length < 10) {
      setError('Please enter a valid phone number');
      return false;
    }
    
    return true;
  };

  // const handleRazorpayPayment = async () => {
  //   if (!validateUserDetails()) return;

  //   setIsLoading(true);
  //   setPaymentStep('processing');
  //   setError('');

  //   try {
  //     const isRazorpayLoaded = await initializeRazorpay();
  //     if (!isRazorpayLoaded) {
  //       throw new Error('Razorpay SDK failed to load');
  //     }

  //     // Create order with hackathon context
  //     const response = await api.post(`${API_URL}/api/payments/create-order`, {
  //       amount: registrationFee,
  //       currency: 'INR',
  //       name: userDetails.name,
  //       email: userDetails.email,
  //       contact: userDetails.phone,
  //       hackathonId: hackathonId,
  //       hackathonName: hackathonName,
  //       paymentMethod:"razorpay"
  //     });

  //     if (!response.data.success) {
  //       throw new Error(response.data.message || 'Failed to create order');
  //     }

  //     const order = response.data.order;
  //     setCurrentOrder(order);

  //     const options = {
  //       key: import.meta.env.VITE_PUBLIC_RZP_KEY_ID,
  //       amount: order.amount,
  //       currency: order.currency,
  //       name: "Hackathon Registration",
  //       description: `Registration for ${hackathonName}`,
  //       order_id: order.id,
  //       prefill: {
  //         name: userDetails.name,
  //         email: userDetails.email,
  //         contact: userDetails.phone,
  //       },
  //       handler: async function (response: any) {
  //         try {
  //           // Verify payment
  //           const verificationResponse = await api.post(`${API_URL}/api/payments/verify-payment`, {
  //             razorpay_payment_id: response.razorpay_payment_id,
  //             razorpay_order_id: response.razorpay_order_id,
  //             razorpay_signature: response.razorpay_signature,
  //             hackathonId: hackathonId,
  //             email: userEmail
  //           });

  //           if (verificationResponse.data.success) {
  //             onPaymentSuccess({
  //               orderId: order.id,
  //               paymentMethod: 'razorpay',
  //               status: 'paid'
  //             });
  //           } else {
  //             setError('Payment verification failed');
  //             setPaymentStep('details');
  //           }
  //         } catch (error) {
  //           console.error('Payment verification error:', error);
  //           setError('Payment verification failed');
  //           setPaymentStep('details');
  //         }
  //       },
  //       modal: {
  //         ondismiss: function() {
  //           setPaymentStep('details');
  //           setIsLoading(false);
  //         }
  //       },
  //       theme: {
  //         color: '#3399cc'
  //       }
  //     };

  //     const rzp = new (window as any).Razorpay(options);
  //     rzp.open();

  //   } catch (error: any) {
  //     console.error('Razorpay payment error:', error);
  //     setError(error.message || 'Failed to initialize payment');
  //     setPaymentStep('details');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleQRPayment = async () => {
    if (!validateUserDetails() || !utrNumber.trim() || !screenshot) {
      setError('Please fill all required fields and upload screenshot');
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
      formData.append('utrNumber', utrNumber);
      formData.append('amount', registrationFee.toString());
      formData.append('screenshot', screenshot);

      const response = await api.post(`${API_URL}/api/registrations/qr-payment`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        onPaymentSuccess({
          orderId: response.data.orderId,
          paymentMethod: 'qrcode',
          status: 'pending_verification'
        });
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      console.error('QR payment error:', error);
      setError(error.message || 'Failed to process QR payment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) {
      setScreenshot(file);
      setScreenshotPreview(URL.createObjectURL(file));
      setError('');
    } else {
      setError('Please upload a valid image file (max 5MB)');
    }
  };

  const handleRemoveScreenshot = () => {
    setScreenshot(null);
    setScreenshotPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
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
            <span className="font-orbitron text-lg sm:text-xl md:text-2xl text-green-400 font-bold">
              ₹{registrationFee}
            </span>
          </p>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 sm:mt-2">for {hackathonName}</p>
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

        {/* Method Selection */}
        {paymentStep === 'method' && (
          <div className="glass-effect p-4 sm:p-6 rounded-lg sm:rounded-xl border border-slate-600/50">
            <h4 className="font-orbitron text-base sm:text-lg text-blue-400 mb-3 sm:mb-4">Choose Payment Method</h4>
            <div className="space-y-2 sm:space-y-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => handleMethodSelect(method.id)}
                  className="w-full p-3 sm:p-4 glass-effect rounded-lg border border-slate-600/50 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="text-blue-400 group-hover:text-cyan-400 transition-colors flex-shrink-0">
                      {method.icon}
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <div className="font-orbitron text-white group-hover:text-cyan-400 transition-colors text-sm sm:text-base truncate">
                        {method.name}
                      </div>
                      <div className="text-xs sm:text-sm text-slate-400 truncate">
                        {method.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* User Details & Payment */}
        {paymentStep === 'details' && (
          <div className="space-y-4 sm:space-y-6">
            {/* User Details */}
            <div className="glass-effect p-4 sm:p-6 rounded-lg sm:rounded-xl border border-slate-600/50">
              <h4 className="font-orbitron text-base sm:text-lg text-blue-400 mb-3 sm:mb-4 flex items-center gap-2">
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
                Contact Details
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
              </div>
            </div>

            {/* Payment Method Specific Content */}
            {/* {selectedMethod === 'razorpay' && (
              <div className="text-center">
                <button
                  onClick={handleRazorpayPayment}
                  disabled={isLoading}
                  className="w-full py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg sm:rounded-xl font-orbitron hover:scale-105 transition-all shadow-lg shadow-blue-500/50 disabled:opacity-50 text-sm sm:text-base"
                >
                  {isLoading ? 'Processing...' : `Pay ₹${registrationFee} with Razorpay`}
                </button>
              </div>
            )} */}

            {selectedMethod === 'qrcode' && (
              <div className="glass-effect p-4 sm:p-6 rounded-lg sm:rounded-xl border border-slate-600/50">
                <h4 className="font-orbitron text-base sm:text-lg text-blue-400 mb-3 sm:mb-4 flex items-center gap-2">
                  <QrCode className="w-4 h-4 sm:w-5 sm:h-5" />
                  QR Code Payment
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  {/* QR Code */}
                  <div className="text-center">
                    <div className="bg-white p-2 sm:p-3 rounded-lg inline-block mb-2 sm:mb-3">
                      <div className="w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                        <div className="text-center text-black">
                          <img
    src={qr}
    alt="UPI QR Code"
    className="w-32 h-32 sm:w-40 sm:h-40 object-contain"
  />
                        </div>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-400">
                      UPI ID: <span className="text-white font-mono text-xs">hackforce@axisbank</span>
                    </p>
                  </div>

                  {/* UTR & Screenshot */}
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm text-slate-400 mb-1 sm:mb-2">UTR Number *</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={utrNumber}
                          onChange={(e) => setUtrNumber(e.target.value)}
                          placeholder="Enter UTR from payment"
                          className="flex-1 p-2 sm:p-3 glass-effect rounded-lg border border-slate-600/50 focus:border-blue-500/50 transition-all outline-none text-white text-sm font-mono"
                        />
                        <button
                          onClick={handleCopyUtr}
                          className="px-2 sm:px-3 glass-effect rounded-lg border border-slate-600/50 hover:border-blue-500/50 transition-colors flex-shrink-0"
                        >
                          {isCopied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Screenshot Upload */}
                    <div>
                      <label className="block text-xs sm:text-sm text-slate-400 mb-1 sm:mb-2">Payment Screenshot *</label>
                      {screenshotPreview ? (
                        <div className="relative">
                          <img 
                            src={screenshotPreview} 
                            alt="Payment screenshot" 
                            className="w-full h-20 sm:h-24 object-cover rounded-lg border border-slate-600/50"
                          />
                          <button
                            onClick={handleRemoveScreenshot}
                            className="absolute top-1 right-1 bg-red-500/80 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-slate-600/50 rounded-lg p-3 sm:p-4 text-center cursor-pointer hover:border-blue-500/50 transition-colors"
                        >
                          <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400 mx-auto mb-1" />
                          <div className="text-xs sm:text-sm text-slate-400">Upload Screenshot</div>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleScreenshotUpload}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleQRPayment}
                  disabled={!utrNumber.trim() || !screenshot || isLoading}
                  className="w-full py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-orbitron hover:scale-105 transition-all shadow-lg shadow-blue-500/50 disabled:opacity-50 text-sm sm:text-base"
                >
                  {isLoading ? 'Processing...' : 'Submit Payment Details'}
                </button>
              </div>
            )}
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

export default PaymentModal;