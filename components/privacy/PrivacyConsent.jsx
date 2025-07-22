import React, { useState, useEffect } from "react";
import { UserPrivacyConsent, User } from "@/api/entities";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Cookie, BarChart3, Mail, Users, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export default function PrivacyConsent() {
  const [user, setUser] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [consents, setConsents] = useState({
    cookies: false,
    analytics: false,
    marketing: false,
    data_processing: true,
    third_party_sharing: false
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Delay consent check to not block initial app load
    const timer = setTimeout(() => {
      checkConsentStatus();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const checkConsentStatus = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      // Check if user has already given consent
      const existingConsents = await UserPrivacyConsent.filter({
        user_id: currentUser.id
      }, "-consent_timestamp");

      if (existingConsents.length === 0) {
        setShowBanner(true);
      } else {
        // Load existing consent preferences
        const consentMap = {};
        existingConsents.forEach(consent => {
          consentMap[consent.consent_type] = consent.consent_given;
        });
        setConsents(prev => ({ ...prev, ...consentMap }));
      }
    } catch (error) {
      // User not authenticated - show banner anyway for anonymous users
      setShowBanner(true);
    }
    setIsLoading(false);
  };

  const saveConsent = async (consentType, given) => {
    if (!user) return;

    try {
      await UserPrivacyConsent.create({
        user_id: user.id,
        consent_type: consentType,
        consent_given: given,
        consent_timestamp: new Date().toISOString(),
        ip_address: 'unknown', // Simplified to avoid external API call
        user_agent: navigator.userAgent,
        consent_version: "1.0",
        jurisdiction: 'General'
      });
    } catch (error) {
      console.error("Error saving consent:", error);
    }
  };

  const handleAcceptAll = async () => {
    const allConsents = {
      cookies: true,
      analytics: true,
      marketing: true,
      data_processing: true,
      third_party_sharing: true
    };

    setConsents(allConsents);

    // Save all consents
    if (user) {
      for (const [type, given] of Object.entries(allConsents)) {
        await saveConsent(type, given);
      }
    }

    setShowBanner(false);
  };

  const handleAcceptEssential = async () => {
    const essentialConsents = {
      cookies: true,
      analytics: false,
      marketing: false,
      data_processing: true,
      third_party_sharing: false
    };

    setConsents(essentialConsents);

    // Save essential consents
    if (user) {
      for (const [type, given] of Object.entries(essentialConsents)) {
        await saveConsent(type, given);
      }
    }

    setShowBanner(false);
  };

  const handleCustomSave = async () => {
    // Save custom consents
    if (user) {
      for (const [type, given] of Object.entries(consents)) {
        await saveConsent(type, given);
      }
    }

    setShowBanner(false);
    setShowDetails(false);
  };

  const consentOptions = [
    {
      key: 'cookies',
      icon: Cookie,
      title: 'Essential Cookies',
      description: 'Required for basic site functionality, login, and security.',
      required: true
    },
    {
      key: 'data_processing',
      icon: Shield,
      title: 'Data Processing',
      description: 'Process your data to provide our FIGMENT platform services.',
      required: true
    },
    {
      key: 'analytics',
      icon: BarChart3,
      title: 'Analytics & Performance', 
      description: 'Help us understand how you use our platform to improve performance.',
      required: false
    },
    {
      key: 'marketing',
      icon: Mail,
      title: 'Marketing Communications',
      description: 'Receive updates about new features, creator spotlights, and platform news.',
      required: false
    },
    {
      key: 'third_party_sharing',
      icon: Users,
      title: 'Third-Party Sharing',
      description: 'Allow sharing anonymized data with trusted partners for research.',
      required: false
    }
  ];

  // Don't render anything while loading to avoid layout shift
  if (isLoading) return null;

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl"
        >
          <div className="max-w-7xl mx-auto p-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-bold text-gray-900">Your Privacy Matters</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  We use cookies and similar technologies to provide our FIGMENT platform services, 
                  analyze usage, and improve your experience. You can customize your preferences below.
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm"
                >
                  Customize
                </Button>
                <Button
                  variant="outline"
                  onClick={handleAcceptEssential}
                  className="text-sm"
                >
                  Essential Only
                </Button>
                <Button
                  onClick={handleAcceptAll}
                  className="bg-blue-600 hover:bg-blue-700 text-sm"
                >
                  Accept All
                </Button>
              </div>
            </div>

            {/* Detailed Settings */}
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-6 pt-6 border-t border-gray-200"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {consentOptions.map((option) => (
                      <div
                        key={option.key}
                        className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg"
                      >
                        <option.icon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-gray-900 text-sm">{option.title}</h4>
                            <Switch
                              checked={consents[option.key]}
                              onCheckedChange={(checked) => 
                                setConsents(prev => ({ ...prev, [option.key]: checked }))
                              }
                              disabled={option.required}
                            />
                          </div>
                          <p className="text-xs text-gray-600">{option.description}</p>
                          {option.required && (
                            <span className="text-xs text-blue-600 font-medium">Required</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowDetails(false)}
                      className="text-sm"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCustomSave}
                      className="bg-blue-600 hover:bg-blue-700 text-sm"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Save Preferences
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}