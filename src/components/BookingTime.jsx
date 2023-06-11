import React, {useState} from 'react';
// import DatePicker from '@mui/x-date-pickers/DatePicker';

export default function BookingTime(){
   let doc_cards = new Array(4).fill(null);;
  //  const [ register, handleSubmit ] = useState();

  const HandleDateSelected = (date)=>{
    console.log('date selected in bookingtime:', date);
  }

  return (
    <div className='wrapper-bkt'>
      <div className='arrow-back-bkt'>
      <img className='arrow-back-bkt' src='src/assets/images/svg/Back.svg' />
      </div>
      <div className='title-bkt'>
        <h1 className='bkt-name h1' > Clinic Name </h1>
      </div>
      <div className='container-body-bkt'>
       <div className='doc-cards-wrapper'>
           {doc_cards.map((card, index) =>
         (<div className='doc-card-in-wrapper'>
           <div className='doc-card-header '>
               <div className='doc-card-name '>
                  <p className='p'> Doctor Name </p>
               </div>
               <div className='doc-card-price '>
                  <p className='p'> 500p </p>
               </div>
           </div>
            <div className='doc-card-info '>
               <span className='bkt-span '> выберите доступное время сеанса </span>
            </div>
            <div className='doc-card-dates-t-wrapper '>
              <div className='doc-card-dates-t '><span className='bkt-span'>11.40</span></div>
              <div className='doc-card-dates-t '><span className='bkt-span'>11.40</span></div>
              <div className='doc-card-dates-t '><span className='bkt-span'>11.40</span></div>
              <div className='doc-card-dates-t '><span className='bkt-span'>11.40</span></div>
            </div>
          </div> ))}
       </div>
       <div className='bkt-calendar-image-wrapper'>
               {/* Date */}
         <div className='calendar'>
            {/* <DatePicker
              value={null}
              onChange={(date) => HandleDateSelected(date) }
              renderInput={(params) => <input {...params} />}
            />  */}
         </div>
          <img className='bkt-img' src='src/assets/images/clinics/clinic_Rusia7.jpeg' />
       </div>
      </div>
    </div>
  );
}
