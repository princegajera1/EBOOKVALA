// Unified Razorpay Payment Gateway Service

export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const initiateRazorpayCheckout = async ({
  amount, // amount in INR
  title,
  description,
  user,
  onSuccess,
  onCancel,
}) => {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded) {
    throw new Error("Razorpay Payment SDK failed to load. Please check your network connection.");
  }

  const razorpayKey =
    import.meta.env.VITE_RAZORPAY_KEY_ID ||
    import.meta.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
    "rzp_test_TGqE1bhMTmSiIw";

  return new Promise((resolve, reject) => {
    const options = {
      key: razorpayKey,
      amount: Math.round((amount || 100) * 100), // convert to paise
      currency: "INR",
      name: "EbookVala",
      description: description || title || "EbookVala Purchase",
      image: "/logo.png",
      handler: function (response) {
        if (onSuccess) {
          onSuccess(response);
        }
        resolve(response);
      },
      modal: {
        ondismiss: function () {
          if (onCancel) onCancel();
          reject(new Error("Payment cancelled by user"));
        },
      },
      prefill: {
        name: user?.displayName || user?.name || "",
        email: user?.email || "",
        contact: user?.phoneNumber || "",
      },
      theme: {
        color: "#3B82F6",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", function (response) {
      reject(new Error(response.error?.description || "Payment Failed"));
    });
    rzp.open();
  });
};
