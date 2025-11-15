import React from 'react';

interface FooterProps {
  navigate: (path: string) => void;
}

const FooterLink: React.FC<{
  path: string;
  navigate: (path: string) => void;
  children: React.ReactNode;
}> = ({ path, navigate, children }) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigate(path);
  };
  return (
    <a href={path} onClick={handleClick} className="text-gray-400 hover:text-white text-sm transition-colors">{children}</a>
  );
};


const Footer: React.FC<FooterProps> = ({ navigate }) => {
  return (
    <footer className="container mx-auto px-4 sm:px-6 lg:px-16 pt-8 pb-12">
      <div className="border-t border-zinc-800/60 mb-8" />
      <div className="flex justify-center items-center">
        <div className="flex items-center gap-x-6">
          <FooterLink path="/privacy-policy" navigate={navigate}>Privacy Policy</FooterLink>
          <FooterLink path="/terms-of-service" navigate={navigate}>Terms of Service</FooterLink>
          <FooterLink path="/faq" navigate={navigate}>FAQ</FooterLink>
        </div>
      </div>
    </footer>
  );
};

export default Footer;