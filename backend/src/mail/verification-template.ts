interface VerificationEmailProps {
    url: string;
    name: string;
}

export const VerificationEmailTemplate = ({ url, name }: VerificationEmailProps) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { background-color: #ffffff; font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif; }
        .container { margin: 0 auto; padding: 20px 0 48px; max-width: 560px; }
        .heading { fontSize: 24px; letter-spacing: -0.5px; line-height: 1.3; font-weight: 400; color: #484848; padding: 17px 0 0; }
        .paragraph { margin: 0 0 15px; font-size: 15px; line-height: 1.4; color: #3c4149; }
        .hr { border-color: #dfe1e4; margin: 42px 0 26px; border-top: 1px solid #dfe1e4; }
        .link { font-size: 14px; color: #b4becc; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="heading">Hi ${name}!</h1>
        <p class="paragraph">
            Thank you for signing up with J'S Ashanti! Please click the link below to verify your
            email address and complete your registration.
        </p>
        <hr class="hr" />
        <a href="${url}" class="link">
            Click here to verify your email address
        </a>
    </div>
</body>
</html>
`;
