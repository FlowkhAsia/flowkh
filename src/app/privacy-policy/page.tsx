import React from 'react';
import { Metadata } from 'next';
import PrivacyPolicyContent from '../../components/PrivacyPolicyPage';

export const metadata: Metadata = {
  title: 'Privacy Policy',
};

export default function PrivacyPolicyPage() {
    return <PrivacyPolicyContent />;
}