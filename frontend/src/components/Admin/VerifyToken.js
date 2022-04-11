import React, { useContext, useEffect, useState } from "react";
import { Button, TextField, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { notifyError, notifySuccess } from "../../utils/Notification";
import { UserContext } from "../../Context/UserContext";
import "./Admin.css";
// import Main from "../Registrations/Main";
import Main from "../Registrations/BgDesign/Main";
import axios from "axios";

export default function VerifyToken() {
  const navigate = useNavigate();

  const { user } = useContext(UserContext);
  const [regDetails, setRegDetails] = useState();
  const [token, setToken] = useState("");
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    if (!user) {
      notifyError("Login to access this page");
      navigate("/admin/login");
    }
  }, [user, navigate]);

  const getDetails = async (e) => {
    e.preventDefault();
    setDisabled(true);
    try {
      const { data } = await axios.get(`/api/admin/details?tokenId=${token}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      });
      if (data.success) {
        setRegDetails(data.details);
      } else {
        notifyError("Invalid token");
      }
      setDisabled(false);
    } catch (err) {
      if (err.response && err.response.data.code === "INVALID_TOKEN") {
        notifyError("Invalid token");
      } else {
        notifyError("Something went wrong. Please try again later");
      }
      setDisabled(false);
    }
  };

  const updatePay = async (token) => {
    setDisabled(true);
    try {
      const { data } = await axios.get(`/api/admin/pay?tokenId=${token}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (data.success) {
        notifySuccess("Updated successfully");
        setRegDetails(null);
        setToken("");
      } else {
        notifyError("Something went wrong. Please try again later");
      }
      setDisabled(false);
    } catch (err) {
      notifyError("Something went wrong. Please try again later");
      setDisabled(false);
    }
  };

  return (
    <Main title="Verify Token">
      {regDetails ? (
        <>
          <div className="regCont">
            <div className="regDetails">
              <h3>Name: {regDetails.name}</h3>
              <p>Category: {regDetails.category.toUpperCase()}</p>
              <p>Event: {regDetails.event}</p>
              <p>Token: {regDetails.tokenId}</p>
              <p>Payment status: {regDetails.paid ? "Paid" : "Not Paid"}</p>
              <p>Payment Mode: {regDetails.paymentMode}</p>
            </div>
            {!regDetails.paid && (
              <div>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => {
                    if (window.confirm("Confirm to Mark token as paid?")) {
                      updatePay(regDetails.tokenId);
                    }
                  }}
                  disabled={disabled}
                >
                  {disabled ? (
                    <CircularProgress size={25} color="secondary" />
                  ) : (
                    <>Mark as paid</>
                  )}
                </Button>
              </div>
            )}
          </div>
          <div
            style={{
              color: "blue",
              float: "right",
              textDecoration: "underline",
              cursor: "pointer",
              fontSize: "1.3em",
            }}
            onClick={() => {
              window.location.reload(false);
            }}
          >
            Verify another Token
          </div>
        </>
      ) : (
        <div className="form">
          <form onSubmit={getDetails}>
            <TextField
              variant="outlined"
              label="TokenId"
              fullWidth
              name="token"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
            <div className="regSub">
              <Button
                type="submit"
                variant="contained"
                color="secondary"
                disabled={disabled}
              >
                {disabled ? (
                  <CircularProgress size={25} color="secondary" />
                ) : (
                  <>Get Details</>
                )}
              </Button>
            </div>
          </form>
        </div>
      )}
    </Main>
  );
}
