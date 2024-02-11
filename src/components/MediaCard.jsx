import { css } from "@emotion/react";
import * as React from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import reviewFullStar from "@/assets/images/svg/reviewFullStar.png";
import reviewHalfStar from "@/assets/images/svg/reviewHalfStar.png";
import "./../App.css";
import { useTranslation } from "react-i18next";
import Button from "@mui/material/Button";

import EventRoundedIcon from "@mui/icons-material/EventRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import DriveIcon from "@mui/icons-material/DriveEta";
import WalkIcon from "@mui/icons-material/DirectionsWalk";

import trazarRuta from "../helpers/drawRoute.js";

export function MediaCard({
  name,
  phone,
  address,
  rating,
  distance,
  formatted_phone_number,
  website,
  opening_hours,
  mapy,
  userPosition,
  destination,
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
              <LocationOnRoundedIcon />
              {distance} km
            </span>
          </div>
          <div className="card-content--div">
            <span className="card-content--span">{address}</span>
            <span className="card-content--item">
              <PhoneRoundedIcon />
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
              <EventRoundedIcon />
              <span>{t("Book time online")}</span>
            </div>
          </div>
          <div className="card-content--div">
            <DriveIcon
              className="media-card--icon"
              onClick={() =>
                trazarRuta(mapy, "DRIVING", userPosition, destination)
              }
            />
            <WalkIcon
              className="media-card--icon"
              onClick={() =>
                trazarRuta(mapy, "WALKING", userPosition, destination)
              }
            />
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
