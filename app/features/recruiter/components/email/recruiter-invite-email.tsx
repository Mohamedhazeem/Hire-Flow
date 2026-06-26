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

interface RecruiterInviteEmailProps {
  url: string;
  invitedByName: string;
}

export const RecruiterInviteEmail = ({ url, invitedByName }: RecruiterInviteEmailProps) => {
  return (
    <Html lang="en">
      <Head />
      <Preview>You&apos;ve been invited to join a team on HireFlow</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Team Invitation</Heading>
          <Text style={paragraph}>
            <strong>{invitedByName}</strong> has invited you to join their recruitment team on{" "}
            <strong>HireFlow</strong>.
          </Text>
          <Text style={paragraph}>
            Click the button below to accept the invitation and gain access to the team dashboard.
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={url}>
              Accept Invitation
            </Button>
            <Text style={separatorText}>— or —</Text>
            <Link href={url} style={fallbackLink}>
              Click here to accept your team invitation.
            </Link>
          </Section>
          <Text style={paragraph}>
            This invitation link is valid for one-time use. If you were not expecting this
            invitation, you can safely ignore this email.
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
