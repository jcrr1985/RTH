import Header from './Header'
import amworld from './amworld';
import { useEffect } from 'react';

export const Onboarding = () => {
  useEffect(() => {
    console.log('useEffect')
    setTimeout(() => {
      amworld()
    }, 1)
  }, []);

  return (
    <div style={{ display: 'flex', justifyContent: 'space-around' }}>
      <Header />
      <div className="" id='chartdiv' style={{ width: '50vw', height: '100vh' }}></div>
    </div>
  );
}
