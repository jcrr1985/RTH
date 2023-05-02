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
    <div style={{ display: 'flex', width: '100vw', height: '100vh', justifyContent: 'flex-start', alignItems: 'center', gap: '2vw' }}>
      <Header info={true} />
      <div className="" id='chartdiv' style={{ width: '50vw', height: '100vh', justifyContent: 'center', alignItems: ' center' }}></div>
    </div>
  );

}