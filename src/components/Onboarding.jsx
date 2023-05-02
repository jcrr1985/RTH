import Header from './Header'
import amworld from './amworld';

//import use effect
import { useEffect } from 'react';

// master
export const Onboarding = () => {
  useEffect(() => {
    console.log('useEffect')
    setTimeout(() => {
      amworld()
    }, 1)
  },
    []);

  return (
    <div style={{ display: 'flex', justifyContent: 'space-around' }}>
      <Header />
      <div className="" id='chartdiv' style={{ width: '50vw', height: '100vh' }}></div>
    </div>
  );

}