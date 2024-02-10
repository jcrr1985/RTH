import { css } from "@emotion/react";
import * as React from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import clinicImg from "@/assets/images/svg/clinic-image.svg";
import reviewFullStar from "@/assets/images/svg/reviewFullStar.png";
import reviewHalfStar from "@/assets/images/svg/reviewHalfStar.png";
import "./../App.css";
import { useTranslation } from "react-i18next";
// openNow, key, photo,

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
        width: "22.600732601vw",
        height: "22.739726027vh",
        borderRadius: "1.025641026vh",
        display: "inline-table!important",
      }}
    >
      <div className="card-content">
        <CardContent>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>{name}</span>
            <span>{distance} km</span>
          </div>
          <div style={{ display: "flex" }}>
            <span>{address}</span>
          </div>
          <div style={{ display: "flex" }}>
            <span>{phone}</span>
          </div>
          <div style={{ display: "flex" }}>
            <span>{formatted_phone_number}</span>
          </div>
          <div style={{ display: "flex" }}>
            <span>{website}</span>
          </div>

          {
            <div css={{ display: "inline-flex" }}>
              {fullStarArray}
              {ratingHasDecimal && (
                <img
                  className="reviewHalfStar"
                  src={reviewHalfStar}
                  alt="reviews"
                  css={{ marginBottom: "0px" }}
                  width={22}
                  height={22}
                />
              )}
            </div>
          }
        </CardContent>
        <CardActions style={{ textAlign: "center" }}>
          <button>{t("book now")}</button>
        </CardActions>
      </div>
    </Card>
  );
}
