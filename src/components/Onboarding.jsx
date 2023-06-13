import Header from './Header'
import amworld from './amworld';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const Onboarding = () => {
  const { t } = useTranslation();

  useEffect(() => {
    setTimeout(() => {
      amworld()
    }, 100)
  }, []);

  return (
    <div style={{ display: 'flex', justifyContent: 'space-around' }}>
      <Header />
      <div className="" id='chartdiv' style={{ width: '50vw', height: '100vh' }}></div>
    </div>
  );
}
