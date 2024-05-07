import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import reviewFullStar from "@/assets/images/svg/reviewFullStar.png";
import reviewHalfStar from "@/assets/images/svg/reviewHalfStar.png";
import "./../App.css";
import { useTranslation } from "react-i18next";
import DriveIcon from "@mui/icons-material/DriveEta";
import WalkIcon from "@mui/icons-material/DirectionsWalk";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

import trazarRuta from "../helpers/drawRoute.js";

const MediaCard = React.memo(
  ({
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
    timeByCar,
    timeByFoot,
  }) => {
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
          // width: "28vw",
          height: "22vh",
          borderRadius: "1",
          display: "inline-table!important",
          marginBottom: "16px",
          boxShadow: "3px 1px 2px #ddd",
          width: "-webkit-fill-available",
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
                  <div className="card-content-text">
                    {
                      <a href={website} target="_blank">
                        {website}
                      </a>
                    }
                  </div>
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
                  <div style={{ display: "flex" }}>
                    <DriveIcon
                      className="media-card--icon"
                      onClick={() =>
                        trazarRuta(mapy, "DRIVING", userPosition, destination)
                      }
                    />
                    {timeByCar ? (
                      <div className="media-card--icon-text">
                        {timeByCar} {t("by car")}
                      </div>
                    ) : null}
                  </div>
                  <div style={{ display: "flex" }}>
                    <WalkIcon
                      className="media-card--icon"
                      onClick={() =>
                        trazarRuta(mapy, "WALKING", userPosition, destination)
                      }
                    />
                    {timeByFoot ? (
                      <div className="media-card--icon-text">
                        {timeByFoot} {t("by foot")}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }
);
export default MediaCard;
