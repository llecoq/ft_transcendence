import { Suspense, lazy } from 'react';
import { Navigate, Route } from 'react-router-dom';
import { RouteObject } from 'react-router';

import TopBarLayout from 'src/layouts/TopBarLayout';

import NoTopBarLayout from 'src/layouts/NoTopBarLayout';

import SuspenseLoader from 'src/components/SuspenseLoader';
import { element } from 'prop-types';

import AuthGuard from 'src/components/AuthGuard';
import GuestGuard from 'src/components/GuestGuard';
import { Path } from 'react-konva';

const RootLoader = (Component) => (props) => {

  return (
    <Suspense fallback={<SuspenseLoader />}>
      <Component {...props} />
    </Suspense>
  );
}

// Pages

const Overview = RootLoader(lazy(() => import('src/views/Welcome')));

const Register = RootLoader(
  lazy(() => import('src/views/Auth/Register'))
);

const Login = RootLoader(
  lazy(() => import('src/views/Auth/Login'))
);

const Settings = RootLoader(
  lazy(() => import('src/views/Settings'))
);

const Userpage = RootLoader(
  lazy(() => import('src/views/Userpage'))
);

// Applications

const Chat = RootLoader(
  lazy(() => import('src/views/Chat'))
);

const Pong = RootLoader(
  lazy(() => import('src/views/Pong'))
);

// Status

const Status404 = RootLoader(
  lazy(() => import('src/views/Status404'))
);

const routes: RouteObject[] = [
  {
    path: '',
    element: <AuthGuard />,
    children: [
      {
        path: '',
        element: <TopBarLayout />,
        children: [
          {
            path: '/',
            element: <Overview />
          },
          {
            path: 'chat',
            element: <Chat />
          },
          {
            path: 'pong',
            element: <Pong/>
          },
          {
            path: 'pong/invite/:inviteFriendId',
            element: <Pong />
          },
          {
            path: 'pong/accept/:acceptInviteGameRoomId',
            element: <Pong />
          },
          {
            path: 'pong/stream/:streamFriendId',
            element: <Pong />
          },
          {
            path: 'settings',
            element: <Settings />
          },
          {
            path: 'userpage/:userId',
            element: <Userpage />
          },
          {
            path: 'overview',
            element: <Navigate to="/" replace />
          },
          {
            path: 'status',
            children: [
              {
                path: '',
                element: <Navigate to="404" replace />
              },
              {
                path: '404',
                element: <Status404 />
              }
            ]
          },
          {
            path: '*',
            element: <Status404 />
          }
        ]
      }
    ]
  },
  {
    path: '',
    element: <GuestGuard />,
    children: [
      {
        path: '',
        element: <NoTopBarLayout />,
        children: [
          {
            path: 'login',
            element: <Login />
          },
          {
            path: 'register',
            element: <Register />
          }
        ]
      }
    ]
  }
];

export default routes;
