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
        question: 'What is Makeen and how does it work?',
        answer: 'Makeen is an Explainable AI platform that helps you understand and interpret complex data insights. It uses advanced machine learning algorithms to provide clear, actionable explanations for AI-driven predictions and decisions.'
      },
      {
        id: 'pb-2',
        question: 'What file formats does Makeen support?',
        answer: 'Makeen supports CSV and XLSX file formats. You can upload datasets in either format, and our platform will automatically process and analyze your data.'
      },
      {
        id: 'pb-3',
        question: 'Is there a file size limit for uploads?',
        answer: 'Yes, the current file size limit is 100MB per upload. For larger datasets, please contact our support team to discuss enterprise solutions.'
      }
    ]
  },
  {
    id: 'uploading-data',
    title: 'Uploading & Data Handling',
    icon: Upload,
    items: [
      {
        id: 'ud-1',
        question: 'How do I upload my data to Makeen?',
        answer: "Simply click the upload button in the chat interface, select your CSV or XLSX file, and our system will process it automatically. You'll receive a confirmation once the upload is complete."
      },
      {
        id: 'ud-2',
        question: 'Is my data secure?',
        answer: 'Absolutely. We use industry-standard encryption for data transmission and storage. Your data is protected with enterprise-grade security measures and is never shared with third parties.'
      },
      {
        id: 'ud-3',
        question: 'Can I delete my uploaded data?',
        answer: 'Yes, you have full control over your data. You can delete any uploaded files from your chat history at any time through the file management interface.'
      }
    ]
  },
  {
    id: 'nlq',
    title: 'Natural Language Query (NLQ)',
    icon: MessageSquare,
    items: [
      {
        id: 'nlq-1',
        question: 'What is Natural Language Query?',
        answer: 'Natural Language Query allows you to ask questions about your data in plain English. Instead of writing complex SQL queries, simply type your question naturally, and Makeen will understand and provide insights.'
      },
      {
        id: 'nlq-2',
        question: 'What kind of questions can I ask?',
        answer: "You can ask analytical questions like 'What were the top 5 products last month?' or 'Show me sales trends for Q4'. Makeen understands context and can handle complex multi-part questions."
      },
      {
        id: 'nlq-3',
        question: 'Does NLQ support multiple languages?',
        answer: "Currently, Makeen's NLQ feature is optimized for English. We're working on adding support for additional languages in future updates."
      }
    ]
  },
  {
    id: 'predictions-explanations',
    title: 'Predictions & Explanations',
    icon: Lightbulb,
    items: [
      {
        id: 'pe-1',
        question: "How accurate are Makeen's predictions?",
        answer: 'Our prediction accuracy varies by use case and data quality, typically ranging from 85-95%. The platform provides confidence scores with each prediction to help you assess reliability.'
      },
      {
        id: 'pe-2',
        question: 'Can I understand why a prediction was made?',
        answer: "Yes! This is Makeen's core feature. We provide detailed explanations for every prediction, showing which factors influenced the result and by how much."
      },
      {
        id: 'pe-3',
        question: 'Can I customize prediction models?',
        answer: 'Advanced users can adjust model parameters and feature selection. Enterprise plans include custom model training tailored to your specific business needs.'
      }
    ]
  },
  {
    id: 'account-security',
    title: 'User Account & Security',
    icon: Shield,
    items: [
      {
        id: 'as-1',
        question: 'How do I reset my password?',
        answer: "Click 'Forgot Password' on the login page, enter your email, and you'll receive a verification code. Enter the code and create a new password."
      },
      {
        id: 'as-2',
        question: 'Can I have multiple users on one account?',
        answer: 'Team and Enterprise plans support multiple users with role-based access control. Contact our sales team to upgrade your account.'
      },
      {
        id: 'as-3',
        question: 'What authentication methods do you support?',
        answer: 'We support email/password authentication with optional two-factor authentication (2FA) for enhanced security. Enterprise plans can integrate with SSO providers.'
      }
    ]
  },
  {
    id: 'history-exports',
    title: 'History & Exports',
    icon: Clock,
    items: [
      {
        id: 'he-1',
        question: 'How long is my chat history saved?',
        answer: 'Chat history is saved indefinitely on your account. You can access all your previous conversations and analyses at any time from the chat sidebar.'
      },
      {
        id: 'he-2',
        question: 'Can I export my analysis results?',
        answer: 'Yes, you can export insights, predictions, and visualizations in multiple formats including PDF, CSV, and PNG for charts and graphs.'
      },
      {
        id: 'he-3',
        question: 'Is there a limit to how many chats I can have?',
        answer: "Currently, there's a limit of 10 active chats. You can delete old chats to make room for new ones, or archive important conversations for future reference."
      }
    ]
  },
  {
    id: 'subscriptions',
    title: 'Subscriptions',
    icon: CreditCard,
    items: [
      {
        id: 'sub-1',
        question: 'Is the Free plan always free?',
        answer: 'Yes! The Free plan will always remain available with core features including predictions, explanations, and natural language queries. Basic usage limits may apply as the platform scales.'
      },
      {
        id: 'sub-2',
        question: 'When will paid plans be available?',
        answer: "Paid subscriptions are planned for a future release after the initial launch. We're focusing on perfecting the core experience first. You'll be notified well in advance when subscriptions become available."
      },
      {
        id: 'sub-3',
        question: 'Will my data remain private?',
        answer: 'Absolutely. Your data privacy is our top priority. All uploaded datasets and generated predictions are secure and never shared with third parties. Enterprise plans will include additional security features and compliance certifications.'
      },
      {
        id: 'sub-4',
        question: 'Can I upgrade later without losing my work?',
        answer: "Yes! When you upgrade to a paid plan, all your existing datasets, chat history, and predictions will be preserved. You'll simply gain access to additional features and higher limits."
      }
    ]
  }
];