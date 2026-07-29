import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "react-email";

interface BanNotificationEmailProps {
  adminName: string;
  reason?: string | null;
  expiresInDays?: number | null;
}

export const BanNotificationEmail = ({
  adminName,
  reason,
  expiresInDays,
}: BanNotificationEmailProps) => {
  return (
    <Html lang="en">
      <Head />
      <Preview>Your HireFlow account has been banned</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Account Banned</Heading>
          <Text style={paragraph}>
            Your HireFlow account has been suspended by <strong>{adminName}</strong>.
          </Text>
          {reason && (
            <Text style={paragraph}>
              <strong>Reason:</strong> {reason}
            </Text>
          )}
          {expiresInDays ? (
            <Text style={paragraph}>
              This suspension will be lifted in <strong>{expiresInDays} day(s)</strong>.
            </Text>
          ) : (
            <Text style={paragraph}>
              This suspension is permanent unless reviewed by the admin team.
            </Text>
          )}
          <Section style={noteBox}>
            <Text style={noteText}>
              If you believe this is a mistake, please contact the admin team to appeal.
            </Text>
          </Section>
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

const noteBox = {
  backgroundColor: "#fef9ef",
  borderRadius: "5px",
  padding: "16px",
  marginTop: "24px",
};

const noteText = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#6b5900",
  margin: 0,
};
