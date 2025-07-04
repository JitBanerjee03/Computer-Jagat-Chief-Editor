import { Outlet } from 'react-router-dom';
import './App.css'
import Footer from './components/Footer';
import Header from './components/Header';
import { ContextProvider } from './store/ContextProvider';

function App() {

  return (
    <>
      <ContextProvider>
        <Header/>
        <div style={{ marginTop: '7%' }}>
          <Outlet />
        </div>
        <Footer/>
      </ContextProvider>
    </>
  )
}

export default App;
