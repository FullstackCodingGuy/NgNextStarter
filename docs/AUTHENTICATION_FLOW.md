# Secure User Authentication with OIDC Authorization Code + PKCE on the Server (BFF)

Using the OpenID Connect (OIDC) Authorization Code Flow with Proof Key for Code Exchange (PKCE) in a Backend for Frontend (BFF) architecture is a highly recommended and secure approach for authenticating users in modern web and mobile applications.

## What is it?

- OpenID Connect (OIDC): Builds on top of OAuth 2.0 to provide an identity layer for authentication. It introduces ID tokens (JSON Web Tokens) for user identity and leverages the secure Authorization Code flow for token acquisition.

- Proof Key for Code Exchange (PKCE): An extension to the Authorization Code Flow designed to protect against authorization code interception attacks, especially relevant for public clients (like SPAs and mobile apps) that cannot securely store a client secret.

- Backend for Frontend (BFF): A dedicated backend service for each frontend client, responsible for handling OIDC authentication, managing tokens, and proxying API requests securely on the server-side.

## How it works

1. Frontend Initiates Login: The user clicks a login button in the frontend application.

2. Frontend Redirects to BFF Login Endpoint: The frontend redirects the user's browser to a login endpoint hosted by the BFF.

3. BFF Initiates OIDC Flow:
   - The BFF (acting as a confidential client) generates a `code_verifier` (a secret string) and derives a `code_challenge` from it.
   - The BFF redirects the user's browser to the Authorization Server (OpenID Provider), including the `code_challenge` in the request.

4. User Authentication & Consent: The Authorization Server displays the login page, the user authenticates, and grants consent.

5. Authorization Code Response: Upon successful authentication, the Authorization Server redirects the user's browser back to the BFF's callback endpoint with an authorization code.

6. BFF Exchanges Code for Tokens:
   - The BFF receives the authorization code and makes a direct, back-channel request to the Authorization Server's token endpoint to exchange the code for an ID token, access token, and potentially a refresh token.
   - The BFF includes the `code_verifier` in this request.
   - The Authorization Server verifies the `code_verifier` against the stored `code_challenge`, preventing code interception attacks.

7. BFF Establishes Session & Redirects: The BFF stores the tokens securely on the server, establishes a session for the user (often using an HttpOnly cookie), and redirects the user back to the frontend application.

8. Frontend Accesses Resources: The frontend can now make requests to the BFF endpoints, and the BFF uses the stored tokens to proxy requests to the protected APIs, without exposing the tokens directly to the frontend.

## Benefits of this approach

- Enhanced Security: Protects against XSS and authorization code interception by keeping tokens off the browser and handling them securely on the server-side. Refresh tokens can also be managed safely by the backend.

- Simplified Frontend: Authentication and token management logic is offloaded to the BFF, reducing frontend complexity.

- Centralized Authentication: Authentication logic is managed in a single, secure location.

- Improved User Experience: Tailored authentication flows can improve the user experience.

- Flexibility & Scalability: The BFF pattern allows for optimization and independent scaling.

## Conclusion

Combining OIDC Authorization Code + PKCE with a BFF architecture offers a secure and efficient way to handle user authentication by managing tokens and secrets on the server.