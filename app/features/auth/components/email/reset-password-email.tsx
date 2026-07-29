import { Body, Button, Container, Head, Heading, Html, Link, Preview, Section, Text } from "react-email";

interface ResetPasswordEmailProps {
  url: string;
}

export const ResetPasswordEmail = ({ url }: ResetPasswordEmailProps) => {
  return (
    <Html lang="en">
      <Head />
      <Preview>Reset your password</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Reset your password</Heading>
          <Text style={paragraph}>
            We received a request to reset your password. Click the button below to choose a new password for your
            account.
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={url}>
              Reset Password
            </Button>
            <Text style={separatorText}>— or —</Text>
            <Link href={url} style={fallbackLink}>
              Click here to reset your password.
            </Link>
          </Section>
          <Text style={paragraph}>
            This link will expire in five minutes. If you did not request a password reset, you can safely ignore this
            email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

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
  display: "inline-block",
  padding: "12px 24px",
};

const separatorText = {
  margin: "15px 0",
  color: "#888888",
  fontSize: "14px",
};

const fallbackLink = {
  display: "block",
  color: "#000000",
  textDecoration: "underline",
  fontSize: "18px",
  fontWeight: "500",
  wordBreak: "break-all" as const,
  marginTop: "10px",
};
