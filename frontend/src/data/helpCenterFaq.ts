import { FileText, Upload, MessageSquare, Lightbulb, Shield, Clock, CreditCard } from 'lucide-react';

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface FaqSection {
  id: string;
  title: string;
  icon: React.ElementType;
  items: FaqItem[];
}

export const helpCenterFaq: FaqSection[] = [
  {
    id: 'platform-basics',
    title: 'Platform Basics',
    icon: FileText,
    items: [
      {
        id: 'pb-1',
        question: 'What is Makeen Fintech and how does it work?',
        answer: 'Makeen Fintech is an Explainable AI platform for credit risk assessment that helps loan officers and risk analysts understand and justify lending decisions. It uses advanced machine learning to provide clear, defensible explanations for every AI-driven credit prediction.'
      },
      {
        id: 'pb-2',
        question: 'What applicant data formats are supported?',
        answer: 'We support CSV and XLSX file formats. You can upload applicant datasets in either format, and the platform will automatically process credit profiles and begin analysis.'
      },
      {
        id: 'pb-3',
        question: 'Is there a file size limit for uploads?',
        answer: 'Yes, the current file size limit is 100MB per upload. For larger applicant pools, please contact our support team to discuss enterprise solutions.'
      }
    ]
  },
  {
    id: 'uploading-data',
    title: 'Uploading Applicant Data & Security',
    icon: Upload,
    items: [
      {
        id: 'ud-1',
        question: 'How do I upload applicant data to the platform?',
        answer: "Simply click the upload button in the interface, select your CSV or XLSX file of applicant data, and our system will process it automatically. You'll receive a confirmation once the upload is complete."
      },
      {
        id: 'ud-2',
        question: 'Is applicant data secure and compliant?',
        answer: 'Absolutely. We use industry-standard encryption for data transmission and storage. Applicant data is protected with enterprise-grade security and is never shared with third parties. The platform is designed with GDPR and financial data compliance in mind.'
      },
      {
        id: 'ud-3',
        question: 'Can I delete uploaded applicant data?',
        answer: 'Yes, you have full control over your data. You can delete any uploaded applicant files from your session history at any time through the file management interface.'
      }
    ]
  },
  {
    id: 'nlq',
    title: 'Natural Language Query for Credit Analysis',
    icon: MessageSquare,
    items: [
      {
        id: 'nlq-1',
        question: 'What is Natural Language Query?',
        answer: 'Natural Language Query lets you ask questions about applicant data and credit patterns in plain English. Instead of writing complex SQL queries, simply type your question naturally and the platform will understand and provide credit risk insights.'
      },
      {
        id: 'nlq-2',
        question: 'What kind of credit questions can I ask?',
        answer: "You can ask questions like 'Which applicants are most likely to default?' or 'What factors predict high credit risk for self-employed borrowers?' The platform understands context and handles complex multi-part risk questions."
      },
      {
        id: 'nlq-3',
        question: 'Does the NLQ feature support multiple languages?',
        answer: "Currently, the NLQ feature is optimized for English. We're working on adding support for additional languages in future updates to serve global lending teams."
      }
    ]
  },
  {
    id: 'predictions-explanations',
    title: 'Credit Risk Assessments & Explanations',
    icon: Lightbulb,
    items: [
      {
        id: 'pe-1',
        question: 'How accurate are credit risk predictions?',
        answer: 'Prediction accuracy varies by data quality and applicant pool, typically ranging from 85-95%. The platform provides confidence scores with each credit assessment to help you evaluate reliability for lending decisions.'
      },
      {
        id: 'pe-2',
        question: 'Can I understand why a credit decision was made?',
        answer: 'Yes — this is the core feature of the platform. We provide detailed factor-by-factor explanations for every credit assessment using SHAP values, showing exactly which applicant attributes drove the risk score and by how much.'
      },
      {
        id: 'pe-3',
        question: 'Can I customize credit risk models?',
        answer: 'Advanced users can adjust model parameters and feature selection. Enterprise plans include custom model training tailored to your specific loan portfolio, risk appetite, and regulatory environment.'
      }
    ]
  },
  {
    id: 'account-security',
    title: 'User Account & Data Security',
    icon: Shield,
    items: [
      {
        id: 'as-1',
        question: 'How do I reset my password?',
        answer: "Click 'Forgot Password' on the login page, enter your email, and you'll receive a verification code. Enter the code and create a new password."
      },
      {
        id: 'as-2',
        question: 'Can I have multiple credit analysts on one account?',
        answer: 'Team and Enterprise plans support multiple users with role-based access control for credit decisions. Contact our sales team to upgrade your account.'
      },
      {
        id: 'as-3',
        question: 'What authentication methods do you support?',
        answer: 'We support email/password authentication with optional two-factor authentication (2FA). Enterprise plans can integrate with SSO providers for seamless access control across lending teams.'
      }
    ]
  },
  {
    id: 'history-exports',
    title: 'Decision History & Exports',
    icon: Clock,
    items: [
      {
        id: 'he-1',
        question: 'How long is credit assessment history saved?',
        answer: 'Credit decision history is saved indefinitely on your account. You can access all previous risk assessments and lending analyses at any time — useful for audit trails and compliance reviews.'
      },
      {
        id: 'he-2',
        question: 'Can I export credit risk results for compliance?',
        answer: 'Yes, you can export risk assessments, credit decisions, and SHAP visualizations in PDF, CSV, and PNG formats — suitable for audit documentation, regulatory reporting, and compliance records.'
      },
      {
        id: 'he-3',
        question: 'Is there a limit to how many sessions I can have?',
        answer: "Currently, there's a limit of 10 active sessions. You can delete old sessions to make room for new ones, or archive important credit assessments for future compliance review."
      }
    ]
  },
  {
    id: 'subscriptions',
    title: 'Subscriptions & Plans',
    icon: CreditCard,
    items: [
      {
        id: 'sub-1',
        question: 'Is the Free plan always free?',
        answer: 'Yes! The Free plan will always remain available with core features including credit risk assessment, factor explanations, and natural language queries. Basic usage limits may apply as the platform scales.'
      },
      {
        id: 'sub-2',
        question: 'When will paid plans be available?',
        answer: "Paid plans will unlock advanced credit modeling, higher applicant volume limits, dedicated support, and compliance reporting features. We're perfecting the core credit risk assessment experience first."
      },
      {
        id: 'sub-3',
        question: 'Will applicant data remain private?',
        answer: "Absolutely. Applicant data privacy is our top priority. All uploaded datasets and credit assessments are secure and never shared with third parties. Enterprise plans include additional compliance certifications."
      },
      {
        id: 'sub-4',
        question: 'Can I upgrade later without losing my work?',
        answer: "Yes! When you upgrade to a paid plan, all your existing applicant datasets, session history, and credit assessments will be preserved. You'll gain access to additional features and higher limits."
      }
    ]
  }
];
