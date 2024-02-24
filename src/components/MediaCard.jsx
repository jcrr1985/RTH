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
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

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
        width: "28vw",
        height: "22vh",
        borderRadius: "1",
        display: "inline-table!important",
        marginBottom: "16px",
        boxShadow: "3px 1px 2px #ddd",
      }}
    >
      <div className="card-content">
        <CardContent>
          <div className="card-content-left-right-container">
            <div className="card-content--item-left">
              <div className="card-content-text" style={{ fontSize: "20px" }}>
                {name}
              </div>
              <div className=" card-content-text">{address}</div>
              {formatted_phone_number ? (
                <div className="card-content-text">
                  {formatted_phone_number}
                </div>
              ) : (
                <div>-</div>
              )}

              {website ? (
                <div className="card-content-text">{website}</div>
              ) : (
                <div>-</div>
              )}

              {rating ? (
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
              ) : (
                <div>No reviews available</div>
              )}
            </div>
            <div className="card-content--item-right">
              <div className="book-time--div">
                <CalendarMonthIcon />
                <span>{t("Book time online")}</span>
              </div>
              <div>
                <DriveIcon
                  className="media-card--icon"
                  onClick={() =>
                    trazarRuta(mapy, "DRIVING", userPosition, destination)
                  }
                />
                <div></div>
                <WalkIcon
                  className="media-card--icon"
                  onClick={() =>
                    trazarRuta(mapy, "WALKING", userPosition, destination)
                  }
                />
              </div>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
