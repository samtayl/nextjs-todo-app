import {getSession} from '@auth0/nextjs-auth0';
import {redirect} from 'next/navigation';

const RootPage = async function() {
  const session = await getSession();

  if (session) {
    redirect('/profile');
  }

  return (
    <div>
      <h1>Hello, stranger! : 3</h1>
      <p><a href="/api/auth/login">Log in</a></p>
    </div>
  );
};

export default RootPage;
