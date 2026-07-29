import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "react-email";

interface VerificationEmailProps {
  url: string;
}

export const VerificationEmail = ({ url }: VerificationEmailProps) => {
  return (
    <Html lang="en">
      <Head />
      <Preview>Verify your email address</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Verify your email</Heading>
          <Text style={paragraph}>
            Thank you for registering! Please click the button below to verify your email address
            and activate your account.
          </Text>
          <Section style={buttonContainer}>
            {/* 1. Primary Action Button */}
            <Button style={button} href={url}>
              Verify Email Address
            </Button>

            {/* 2. Styled Separator Text */}
            <Text style={separatorText}>— or —</Text>

            {/* 3. Large, Shortened, Vertical Fallback Link */}
            <Link href={url} style={fallbackLink}>
              Click here to verify your email address.
            </Link>
          </Section>
          <Text style={paragraph}>
            This link will expire in 1 hour. If you did not create an account, you can safely ignore
            this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

// Clean styling that works perfectly across Gmail, Apple Mail, and Outlook
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 20px",
  borderRadius: "8px",
  maxWidth: "560px",
};

const heading = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#1a1f36",
  margin: "0 0 20px 0",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#4f566b",
  margin: "0 0 20px 0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "30px 0",
};

const button = {
  backgroundColor: "#000000",
  borderRadius: "5px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block", // Ensures padding boxes layout correctly
  padding: "12px 24px",
};
const separatorText = {
  margin: "15px 0",
  color: "#888888",
  fontSize: "14px",
};

// New Style: Expands font-size, forces vertical block order, and limits text wrapping breaks
const fallbackLink = {
  display: "block", // Forces link onto a brand new line vertically
  color: "#000000",
  textDecoration: "underline",
  fontSize: "18px", // Makes the text look larger and more visible
  fontWeight: "500",
  wordBreak: "break-all" as const, // Prevents layout overflowing on narrower client screens
  marginTop: "10px",
};
