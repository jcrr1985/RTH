import { useState } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker'
import dayjs, { Dayjs } from 'dayjs'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField'
import React from 'react'
import { useForm } from "react-hook-form"

const DatePicker_requestForm = (props) => {
    const [date, setDate] = useState(null);
    const handleChange = (newDate) => {
        setDate(newDate);
    }

    return (
        <Tooltip  style={{ width:'33%' }}>
        {/* title={props.showTooltip} */}
            <div className="tooltip-shower">
                <div className="tooltip not-specialities-dropdown">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <MobileDatePicker
                            label="Date"
                            inputFormat="MM/DD/YYYY"
                            value={date}
                            onChange={handleChange}
                            renderInput={(params) => <TextField {...params}
                                sx={{
                                 backgroundColor: '#fafafa',
                                 borderRadius: '14px',
                                 border: 'none',
                                 width: '-webkit-fill-available',
                                 boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)'
                                  }}
                            />}
                        />
                    </LocalizationProvider>
                </div>
            </div>
        </Tooltip>
    )
}

export default DatePicker_requestForm
