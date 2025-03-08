/* @refresh reload */
import { render } from "solid-js/web";
import "./index.css";
import App from "./App.jsx";
import { Myapp } from "../context/index.jsx";

const root = document.getElementById("root");

render(
  () => (
    <Myapp>
      <App />
    </Myapp>
  ),
  root
);
