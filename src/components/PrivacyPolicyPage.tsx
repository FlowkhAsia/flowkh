import React from 'react';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="px-4 md:px-16 pt-28 pb-24 min-h-screen">
      <div className="max-w-4xl mx-auto text-gray-300 leading-relaxed">
        <h1 className="text-4xl font-bold mb-6 text-white">Privacy Policy for flowkh</h1>
        <p className="mb-4"><strong>Last Updated:</strong> July 26, 2024</p>

        <p className="mb-6">
          Welcome to flowkh ("we," "us," or "our"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website (the "Service"). Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4 text-white">1. INFORMATION WE COLLECT</h2>
        <p className="mb-4">We do not require you to create an account or provide any personally identifiable information to use our Service. The information we collect is limited to the following categories:</p>
        <ul className="list-disc list-inside mb-4 pl-4 space-y-2">
          <li><strong>Client-Side Data (LocalStorage):</strong> To enhance your experience, we store certain data directly on your device using your browser's local storage. This includes your "My List" of saved movies/shows and your selected theme preference. This data is not transmitted to our servers and remains solely on your computer.</li>
          <li><strong>Usage Data (Analytics):</strong> We use third-party analytics services like Google Analytics to help us understand how our Service is used. These services may automatically collect information such as your IP address, browser type, operating system, pages viewed, and the dates/times of your visits. This information is aggregated and anonymized to help us improve the Service.</li>
        </ul>
        
        <h2 className="text-2xl font-bold mt-8 mb-4 text-white">2. HOW WE USE YOUR INFORMATION</h2>
        <p className="mb-4">We use the information we collect to:</p>
        <ul className="list-disc list-inside mb-4 pl-4 space-y-2">
            <li>Provide, operate, and maintain our Service.</li>
            <li>Improve, personalize, and expand our Service.</li>
            <li>Understand and analyze how you use our Service.</li>
            <li>Monitor for and prevent technical issues.</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4 text-white">3. THIRD-PARTY SERVICES</h2>
        <p className="mb-4">Our Service relies on several third-party services to function. These services have their own privacy policies and are not controlled by us.</p>
        <ul className="list-disc list-inside mb-4 pl-4 space-y-2">
            <li><strong>The Movie Database (TMDB):</strong> All movie and TV show data, including titles, descriptions, and images, is provided by the TMDB API. When you use our Service, your browser makes requests to TMDB's servers.</li>
            <li><strong>Google Analytics:</strong> As mentioned, we use Google Analytics for usage analysis. You can learn more about how Google uses data by visiting their <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer" className="text-[var(--brand-color)] hover:underline">Privacy & Terms</a> page.</li>
            <li><strong>Embedded Video Players:</strong> Our Service provides access to embedded video players from various third-party sources. When you watch a video, you are interacting directly with these third-party services. They may use cookies and other tracking technologies to collect data about your viewing habits. We do not control these services and are not responsible for their data collection practices. We encourage you to review their respective privacy policies.</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4 text-white">4. DATA SECURITY</h2>
        <p className="mb-4">
            We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access. However, please be aware that no security measures are perfect or impenetrable, and we cannot guarantee "perfect security."
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4 text-white">5. CHILDREN'S PRIVACY</h2>
        <p className="mb-4">
            Our Service is not intended for use by children under the age of 13. We do not knowingly collect personally identifiable information from children under 13. If you become aware that a child has provided us with personal information, please contact us.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4 text-white">6. CHANGES TO THIS PRIVACY POLICY</h2>
        <p className="mb-4">
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4 text-white">7. CONTACT US</h2>
        <p className="mb-4">If you have any questions about this Privacy Policy, please contact us at: <a href="mailto:admin@flowkh.pages.dev" className="text-[var(--brand-color)] hover:underline">admin@flowkh.pages.dev</a></p>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;