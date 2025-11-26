import { Metadata } from 'next';
import FAQContent from '../../components/FAQPage';

export const metadata: Metadata = {
    title: 'Frequently Asked Questions'
};

export default function FAQPage() {
    return <FAQContent />;
}