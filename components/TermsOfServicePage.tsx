import React from 'react';

const TermsOfServicePage: React.FC = () => {
  return (
    <div className="px-4 md:px-16 pt-28 pb-24 min-h-screen">
      <div className="max-w-4xl mx-auto text-gray-300 leading-relaxed">
        <h1 className="text-4xl font-bold mb-6 text-white">Terms of Service for flowkh</h1>
        <p className="mb-4"><strong>Last Updated:</strong> July 26, 2024</p>

        <p className="mb-6">
          Please read these Terms of Service ("Terms") carefully before using the flowkh website (the "Service") operated by us. Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Service.
        </p>
        <p className="mb-6">By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service.</p>

        <h2 className="text-2xl font-bold mt-8 mb-4 text-white">1. Description of Service</h2>
        <p className="mb-4">
          flowkh is a user interface that acts as a discovery tool for movies and TV shows. The Service allows users to browse, search, and discover content information provided by a third-party movie and TV show database. All video content is streamed via embedded players from third-party, publicly available sources.
        </p>
        <p className="font-bold text-white mb-4">
          IMPORTANT: flowkh does not host, store, upload, or distribute any video content. We are an index and database of content found publicly on the internet. All video players are embedded from third-party streaming services that are not affiliated with us.
        </p>
        
        <h2 className="text-2xl font-bold mt-8 mb-4 text-white">2. Third-Party Content</h2>
        <p className="mb-4">
            The Service provides links to and embeds content from third-party websites and services that are not owned or controlled by flowkh. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services.
        </p>
        <p className="mb-4">
            You further acknowledge and agree that flowkh shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with the use of or reliance on any such content, goods or services available on or through any such web sites or services. We are not responsible for the accuracy, legality, or copyright compliance of the content provided by these third parties.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4 text-white">3. Intellectual Property</h2>
        <p className="mb-4">
            The Service and its original content (excluding content provided by users or third parties), features, and functionality are and will remain the exclusive property of flowkh and its licensors. All metadata and artwork for movies and TV shows are provided by our third-party data source and are the property of their respective owners.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4 text-white">4. User Conduct</h2>
        <p className="mb-4">You agree not to use the Service:</p>
        <ul className="list-disc list-inside mb-4 pl-4 space-y-2">
            <li>For any unlawful purpose.</li>
            <li>To solicit others to perform or participate in any unlawful acts.</li>
            <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others.</li>
            <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate based on gender, sexual orientation, religion, ethnicity, race, age, national origin, or disability.</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4 text-white">5. Disclaimer of Warranties</h2>
        <p className="mb-4">
            The Service is provided on an "AS IS" and "AS AVAILABLE" basis. Your use of the Service is at your sole risk. We do not warrant that a) the Service will function uninterrupted, secure, or available at any particular time or location; b) any errors or defects will be corrected; c) the results of using the Service will meet your requirements.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4 text-white">6. Limitation of Liability</h2>
        <p className="mb-4">
            In no event shall flowkh, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4 text-white">7. Changes to These Terms</h2>
        <p className="mb-4">
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of changes by posting the new Terms on this page. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4 text-white">8. CONTACT US</h2>
        <p className="mb-4">If you have any questions about these Terms, please contact us at: <a href="mailto:admin@flowkh.pages.dev" className="text-[var(--brand-color)] hover:underline">admin@flowkh.pages.dev</a></p>
      </div>
    </div>
  );
};

export default TermsOfServicePage;