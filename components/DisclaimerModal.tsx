"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState, useCallback } from "react";
import { createClient } from "@/libs/supabase/client";
import toast from "react-hot-toast";
import { useTranslation } from "@/libs/i18n";

const DisclaimerModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const supabase = createClient();
  const { t } = useTranslation();

  const checkDisclaimerStatus = useCallback(async () => {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        // User not logged in, don't show modal
        setIsLoading(false);
        return;
      }

      // Check if user has already confirmed disclaimer
      const { data, error } = await supabase
        .from("disclaimer_confirmations")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error checking disclaimer status:", error);
        setIsLoading(false);
        return;
      }

      // If no confirmation record exists, show the modal
      if (!data) {
        setIsOpen(true);
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error in checkDisclaimerStatus:", error);
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    checkDisclaimerStatus();
  }, [checkDisclaimerStatus]);

  const handleConfirm = async () => {
    if (!isChecked) {
      toast.error("Please check the confirmation box first");
      return;
    }

    setIsConfirming(true);

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        toast.error("Please sign in first");
        setIsConfirming(false);
        return;
      }

      // Insert confirmation record
      const { error } = await supabase
        .from("disclaimer_confirmations")
        .insert({
          user_id: user.id,
        });

      if (error) {
        console.error("Error confirming disclaimer:", error);
        toast.error("Confirmation failed, please try again");
        setIsConfirming(false);
        return;
      }

      // Success - close modal
      toast.success("Confirmation successful");
      setIsOpen(false);
    } catch (error) {
      console.error("Error in handleConfirm:", error);
      toast.error("Confirmation failed, please try again");
      setIsConfirming(false);
    }
  };

  // Don't render anything while loading or if modal should not be shown
  if (isLoading || !isOpen) {
    return null;
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={() => {}} // Empty function - prevents closing on outside click
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-70" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-base-100 p-6 md:p-8 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-2xl font-bold text-center mb-6 text-error"
                >
                  ⚠️ {t("disclaimerModal.title")}
                </Dialog.Title>

                <div className="space-y-4 mb-6 text-base-content/80 max-h-[60vh] overflow-y-auto">
                  <div className="bg-base-200 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 text-base-content">
                      1. Educational Purpose
                    </h4>
                    <p className="text-sm">
                      This platform (Chartiqs) provides educational analysis of commodity market factors only, designed to help users understand various factors affecting commodity prices. All content is for learning purposes only.
                    </p>
                  </div>

                  <div className="bg-base-200 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 text-base-content">
                      2. Not Investment Advice
                    </h4>
                    <p className="text-sm">
                      All analysis, data, charts, and AI-generated content provided on this platform <strong className="text-error">do not constitute any investment advice</strong>, trading strategies, or buy/sell recommendations. Users should not rely solely on platform content for investment decisions.
                    </p>
                  </div>

                  <div className="bg-base-200 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 text-base-content">
                      3. High Risk Warning
                    </h4>
                    <p className="text-sm">
                      Commodities and futures trading involve <strong className="text-error">extremely high market risk</strong>, with significant price volatility that may result in total loss of principal. Such investments are not suitable for all investors. Please fully assess your risk tolerance.
                    </p>
                  </div>

                  <div className="bg-base-200 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 text-base-content">
                      4. AI Analysis Limitations
                    </h4>
                    <p className="text-sm">
                      This platform uses AI technology to generate market analysis. While we strive for accuracy, AI models may contain comprehension bias, data lag, or analytical errors. AI-generated content should not be considered professional financial advice.
                    </p>
                  </div>

                  <div className="bg-base-200 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 text-base-content">
                      5. Data Accuracy
                    </h4>
                    <p className="text-sm">
                      While we strive to ensure data accuracy and timeliness, we cannot guarantee all information is completely accurate, complete, or current. Market data comes from third parties and may be delayed or contain errors.
                    </p>
                  </div>

                  <div className="bg-base-200 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 text-base-content">
                      6. Limitation of Liability
                    </h4>
                    <p className="text-sm">
                      The platform operators assume no responsibility for any profits or losses resulting from investment decisions made by users based on platform content. Please make investment decisions under professional guidance.
                    </p>
                  </div>

                  <div className="bg-error/10 border border-error/30 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-center text-error">
                      {t("disclaimerModal.riskWarning")}
                    </p>
                    <p className="text-xs text-center mt-2 text-base-content/60">
                      Please ensure you fully understand the associated risks and consult professionals before making any investment decisions
                    </p>
                  </div>
                </div>

                <div className="border-t border-base-300 pt-4">
                  <label className="flex items-start space-x-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => setIsChecked(e.target.checked)}
                      className="checkbox checkbox-primary mt-1 flex-shrink-0"
                    />
                    <span className="text-sm text-base-content group-hover:text-primary transition-colors">
                      {t("disclaimerModal.agreement")}
                    </span>
                  </label>
                </div>

                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    className="btn btn-primary btn-wide"
                    onClick={handleConfirm}
                    disabled={!isChecked || isConfirming}
                  >
                    {isConfirming ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Confirming...
                      </>
                    ) : (
                      t("disclaimerModal.confirm")
                    )}
                  </button>
                </div>

                <p className="text-xs text-center mt-4 text-base-content/40">
                  {t("disclaimerModal.onceOnly")}
                </p>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default DisclaimerModal;
