/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react"
import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import clinicImg from '@/assets/images/svg/clinic-image.svg';
import clinic_Chipre1 from '@/assets/images/clinics/clinic_Chipre1.jpeg';
import reviewFullStar from '@/assets/images/svg/reviewFullStar.png';
import reviewHalfStar from '@/assets/images/svg/reviewHalfStar.png';
import './../App.css'

import { Link } from 'react-router-dom'


export function MediaCard({ name, phone, address, rating, openNow, key, photo, distance }) {
    let url_img = `src/assets/images/clinics/${photo}`;
    let ratingHasDecimal = rating % 1 !== 0 ? true : false;

    const fullStarArray = Array(Math.floor(rating)).fill().map(() => {
        return (
            <img className="reviewFullStar" src={reviewFullStar} alt="reviews" css={{ marginBottom: '4px' }} width={25} />
        )
    })
  return (
    <Link to='../BookingTime' style={{ textDecoration: 'none', }} className="header-info-link link">  
        <Card sx={{
            width: '22.600732601vw',
            height: '22.739726027vh',
            borderRadius: '1.035641026vh',
            display: 'inline-table!important',
        }} 
            key={key} >
            <CardMedia
                sx={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    height: 'auto',
                }}
                image={url_img ? url_img : clinicImg}
                title="clinic image"
            />
            <div className='card-content'>
                <CardContent>
                    <Typography gutterBottom variant="h6" component="div" >
                        {name}
                    </Typography>
                    <Typography variant="body2" >
                        {phone}
                    </Typography>
                    <Typography variant="body2" style={{ color: 'black', padding: '3px', marginBlockEnd: '-7', fontWeight: 'bold' }}>
                    address: <span>  {address}  </span>
                    </Typography>
                    <div css={{ display: 'flex', alignItems: 'center', marginBlockEnd: '-11' }}>
                      <Typography variant="body2" style={{ color: 'black', padding: '3px', fontWeight: 'bold' }}>
                         distance: <span> {distance}km </span>
                      </Typography>
        
                    </div>
                 { rating && <div css={{ display: 'inline-flex' }}>
                        <Typography variant="body2" css={{ marginBlockEnd: '-11', padding: '3px', fontWeight: 'bold'}} >
                        rating: <span> {rating} </span>
                        </Typography>
                        {(<>
                            {fullStarArray}
                            {ratingHasDecimal && <img className="reviewHalfStar" src={reviewHalfStar} alt="reviews" css={{ marginBottom: '0px' }} width={25} height={25} />}
                        </>)}
                    </div>}
                    <Typography variant="body2" color="text.secondary">
                        {openNow}
                    </Typography>
                </CardContent>
                <CardActions style={{ textAlign: 'center', fontSize: '1.2rem' }}>
                    <button>Book now</button>
                </CardActions>
            </div>
        </Card>
    </Link>   
  );
}