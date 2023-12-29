import {UserProvider} from '@auth0/nextjs-auth0/client';

const RootLayout = function({children}) {
  return (
    <html lang="en">
      <UserProvider>
        <body>
          {children}
        </body>
      </UserProvider>
    </html>
  );
};

export default RootLayout;
