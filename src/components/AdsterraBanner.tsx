import React, { useEffect, useRef } from 'react';

const AdsterraBanner: React.FC = () => {
  const adContainerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only add scripts if the container is empty to prevent duplicates on re-renders
    if (adContainerRef.current && adContainerRef.current.children.length === 0) {
      const configScript = document.createElement('script');
      configScript.type = 'text/javascript';
      configScript.textContent = `
        atOptions = {
          'key' : '1dc987ecfc5739894b219e4b8521bfba',
          'format' : 'iframe',
          'height' : 90,
          'width' : 728,
          'params' : {}
        };
      `;

      const invokeScript = document.createElement('script');
      invokeScript.type = 'text/javascript';
      invokeScript.src = "//sparrowcanned.com/1dc987ecfc5739894b219e4b8521bfba/invoke.js";

      adContainerRef.current.appendChild(configScript);
      adContainerRef.current.appendChild(invokeScript);
    }
  }, []);
  
  useEffect(() => {
    const handleResize = () => {
      if (wrapperRef.current && adContainerRef.current) {
        const containerWidth = wrapperRef.current.offsetWidth;
        const adWidth = 728;
        const adHeight = 90;

        if (containerWidth < adWidth) {
          const scale = containerWidth / adWidth;
          adContainerRef.current.style.transform = `scale(${scale})`;
          wrapperRef.current.style.height = `${adHeight * scale}px`;
        } else {
          adContainerRef.current.style.transform = 'scale(1)';
          wrapperRef.current.style.height = `${adHeight}px`;
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    // Clean up the event listener on component unmount
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    // The wrapper controls the available width and its height is adjusted by JS to prevent layout shifts
    <div ref={wrapperRef} className="my-8 md:my-12 w-full max-w-[728px] mx-auto flex justify-center items-center transition-all duration-200">
       {/* The container has the fixed ad size and is scaled down by JS */}
      <div ref={adContainerRef} style={{ width: '728px', height: '90px', transformOrigin: 'center' }} />
    </div>
  );
};

export default AdsterraBanner;