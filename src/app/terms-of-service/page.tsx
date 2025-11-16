import React from 'react';
import { Metadata } from 'next';
import TermsOfServiceContent from '../../components/TermsOfServicePage';

export const metadata: Metadata = {
  title: 'Terms of Service',
};

export default function TermsOfServicePage() {
    return <TermsOfServiceContent />;
}