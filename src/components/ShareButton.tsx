import { Check, Share, Share2 } from "lucide-react";
import React, { useState } from "react";

interface ShareButtonProps {
  url: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ url }) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Resume",
          url: url,
        });
      } catch (error) {
        console.error("Error sharing : ", error);
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors" onClick={handleShare}>
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          Copied !!
        </>
      ) : (
        <>
          <Share2 className="h-4 size-4" />
          Share Resume
        </>
      )}
    </button>
  );
};

export default ShareButton;
