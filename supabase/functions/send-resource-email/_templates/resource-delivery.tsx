import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Button,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface Resource {
  title: string;
  description: string | null;
  file_url: string;
  file_name: string;
}

interface ResourceDeliveryEmailProps {
  fullName: string | null;
  pageTitle: string;
  resources: Resource[];
}

export const ResourceDeliveryEmail = ({
  fullName,
  pageTitle,
  resources,
}: ResourceDeliveryEmailProps) => (
  <Html>
    <Head />
    <Preview>Your resources from {pageTitle} are ready</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>ShareKit</Heading>
        
        <Heading style={h2}>
          {fullName ? `Hi ${fullName}!` : 'Hi there!'}
        </Heading>
        
        <Text style={text}>
          Thank you for your interest in <strong>{pageTitle}</strong>. 
          Here are your downloadable resources:
        </Text>
        
        {resources.map((resource, index) => (
          <Section key={index} style={resourceCard}>
            <Heading style={resourceTitle}>{resource.title}</Heading>
            {resource.description && (
              <Text style={resourceDescription}>{resource.description}</Text>
            )}
            <Button style={button} href={resource.file_url}>
              Download {resource.file_name}
            </Button>
          </Section>
        ))}
        
        <Section style={footer}>
          <Text style={footerText}>
            This email was sent because you requested access to resources from ShareKit.
            If you didn't make this request, you can safely ignore this email.
          </Text>
        </Section>
        
        <Text style={copyright}>
          Powered by ShareKit
        </Text>
      </Container>
    </Body>
  </Html>
);

export default ResourceDeliveryEmail;

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

const text = {
  color: '#666',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 20px',
};

const resourceCard = {
  backgroundColor: '#f5f5f5',
  borderRadius: '8px',
  margin: '20px',
  padding: '24px',
};

const resourceTitle = {
  color: '#333',
  fontSize: '20px',
  fontWeight: '600',
  margin: '0 0 10px 0',
};

const resourceDescription = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 16px 0',
};

const button = {
  backgroundColor: '#667eea',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
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
  margin: '0',
};

const copyright = {
  color: '#999',
  fontSize: '12px',
  textAlign: 'center' as const,
  marginTop: '30px',
};
