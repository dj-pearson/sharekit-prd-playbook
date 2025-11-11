import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface SequenceEmailProps {
  fullName: string | null;
  subject: string;
  bodyContent: string;
}

export const SequenceEmail = ({
  fullName,
  subject,
  bodyContent,
}: SequenceEmailProps) => (
  <Html>
    <Head />
    <Preview>{subject}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>ShareKit</Heading>
        
        <Heading style={h2}>
          {fullName ? `Hi ${fullName}!` : 'Hi there!'}
        </Heading>
        
        <Section style={content}>
          <div dangerouslySetInnerHTML={{ __html: bodyContent }} />
        </Section>
        
        <Section style={footer}>
          <Text style={footerText}>
            You're receiving this email because you signed up for resources from ShareKit.
          </Text>
          <Text style={footerText}>
            If you'd like to stop receiving these emails, please contact us.
          </Text>
        </Section>
        
        <Text style={copyright}>
          Powered by ShareKit
        </Text>
      </Container>
    </Body>
  </Html>
);

export default SequenceEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const h1 = {
  color: '#667eea',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
};

const h2 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '30px 20px 20px',
  padding: '0',
};

const content = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 20px',
};

const footer = {
  borderTop: '1px solid #e5e5e5',
  margin: '32px 20px 0',
  paddingTop: '20px',
};

const footerText = {
  color: '#999',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '8px 0',
};

const copyright = {
  color: '#999',
  fontSize: '12px',
  textAlign: 'center' as const,
  marginTop: '30px',
};
