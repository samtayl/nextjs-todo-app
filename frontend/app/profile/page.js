import {getSession, withPageAuthRequired} from '@auth0/nextjs-auth0';

const ProfilePage = async () => {
  const {accessToken} = await getSession();
  let profile;

  const response = await fetch(`${process.env.API_URL}/profile`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.ok) {
    profile = await response.json();
  }

  return (
    <>
      <h1>Hello, {profile.username}! : 3</h1>
      <p><a href="/api/auth/logout">Log out</a></p>
    </>
  );
};

export default withPageAuthRequired(ProfilePage, {returnTo: '/profile'});
