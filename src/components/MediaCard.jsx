import { css } from "@emotion/react";
import * as React from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import reviewFullStar from "@/assets/images/svg/reviewFullStar.png";
import reviewHalfStar from "@/assets/images/svg/reviewHalfStar.png";
import "./../App.css";
import { useTranslation } from "react-i18next";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";

export function MediaCard({
  name,
  phone,
  address,
  rating,
  distance,
  formatted_phone_number,
  website,
  opening_hours,
}) {
  const { t } = useTranslation();
  let ratingHasDecimal = rating % 1 !== 0 ? true : false;

  const fullStarArray = Array(Math.floor(rating))
    .fill()
    .map(() => {
      return (
        <img
          className="reviewFullStar"
          src={reviewFullStar}
          alt="reviews"
          css={{ marginBottom: "4px" }}
          width={25}
        />
      );
    });
  return (
    <Card
      sx={{
        width: "27vw",
        height: "22vh",
        borderRadius: "1",
        display: "inline-table!important",
        marginBottom: "16px",
        boxShadow: "3px 1px 2px #ddd",
      }}
    >
      <div className="card-content">
        <CardContent>
          <div className="card-content--div">
            <span>{name}</span>
            <span className="card-content--item">
              <LocationOnRoundedIcon className="book-now-icon" />
              {distance} km
            </span>
          </div>
          <div className="card-content--div">
            <span className="card-content--span">{address}</span>
            <span className="card-content--item">
              <PhoneRoundedIcon className="book-now-icon" />
              {formatted_phone_number}
            </span>
          </div>
          <div className="card-content--div">
            <a href={website} target="_blank" rel="noopener noreferrer">
              <span>{website}</span>
            </a>
            <div css={{ display: "inline-flex" }}>
              {fullStarArray}
              {ratingHasDecimal && (
                <img
                  className="reviewHalfStar"
                  src={reviewHalfStar}
                  alt="reviews"
                  width={22}
                  height={22}
                />
              )}
            </div>
            <div className="card-content--item">
              <EventRoundedIcon className="book-now-icon" />
              <span>{t("Book time online")}</span>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
