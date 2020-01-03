import React from "react";
import ReactDOM from "react-dom";
import App from "./app.js";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"

const stylelink = document.createElement("link");
stylelink.rel = "stylesheet";
stylelink.href = "https://cdn.jsdelivr.net/npm/semantic-ui/dist/semantic.min.css";
document.head.appendChild(stylelink);

ReactDOM.render(
    <App />,
    document.getElementById("root")
);

