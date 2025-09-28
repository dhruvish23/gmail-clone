import './App.css'
import './index.css'
import Inbox from './components/Inbox'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Body from './components/Body'
import Mail from './components/Mail'
import SendEmail from './components/SendEmail'
import Login from './components/Login'
import Signup from './components/Signup'
import { Toaster } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import Sent from './components/Sent';

// Use environment variable to set basename dynamically
const baseName = import.meta.env.MODE === 'production' ? '/gmail-clone' : '/';

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <Body />,
    children: [
      {
        path: "/",
        element: <Inbox />,
      },
      {
        path: "/mail/:id",
        element: <Mail />,
      },
      {
        path: "/sent",
        element: <Sent />,
      },
    ]
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    basename: baseName, // This fixes routing for GitHub Pages
  }
]);

function App() {
  const { backgroundImage } = useSelector(store => store.gmail);
  console.log(backgroundImage);
  const appStyle = {
    backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed'
  };

  return (
    <>
      <div className='bg-[#f6f8fc] h-screen' style={appStyle}>
        {/* Overlay for better readability when background image is present */}
        {backgroundImage && (
          <div className="absolute inset-0 bg-white bg-opacity-80 pointer-events-none z-0"></div>
        )}

        <div className="relative z-10">
          <RouterProvider router={appRouter} />
          <div className='absolute w-[30%] right-20 bottom-0 z-20'>
            <SendEmail />
          </div>
          <Toaster />
        </div>
      </div>
    </>
  )
}

export default App